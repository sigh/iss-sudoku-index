// Title: Chaos Power
// Author: Panthera
// Video: https://www.youtube.com/watch?v=QlzevsegHlo
// Source: https://app.crackingthecryptic.com/sudoku/QLMfpLdG9R

// Rules encoded:
// - Normal sudoku: 1-9 once per row/column. No fixed boxes (NoBoxes); instead
//   ChaosConstruction discovers nine orthogonally-connected size-9 regions,
//   each containing every digit once ("Regions, which each contain 1-9
//   orthogonally connected, must be determined").
// - "Either all or no cells within a region are shaded": a VS shade overlay
//   (SHADED/UNSHADED) is tied to the CC region-label overlay on every grid
//   edge -- same CC label forces the same shade. Since ChaosConstruction's
//   regions are themselves orthogonally connected, this local per-edge tie
//   propagates to full-region uniformity without needing a global pairwise
//   comparison.
// - Japanese Sums: each clued row/column's outside numbers are, in order,
//   the digit-sums of its maximal shaded runs (>=1 unshaded cell between
//   runs); an unclued row/column has no shaded cells. Clue order is read
//   farthest-from-grid first == first-run-to-last-run order (same-author
//   convention for this clue style; not stated in this puzzle's own text).
// - Hidden 3x3 magic square: "hidden somewhere in the picture" with no
//   stated position, so it is encoded as a disjunction over every one of the
//   49 axis-aligned 3x3 windows; only the stated sum-equality across its 8
//   lines is required, not digit distinctness (the rule states sums only).

const SHADED = 1;
const UNSHADED = 2;

// Outside-clue lists, farthest-from-grid first (first run to last run),
// transcribed from the source's outside-clue overlay text.
const ROW_CLUES = {
  2: [31],
  3: [10, 3, 7],
  4: [5, 1, 3],
  5: [6, 5, 4],
  6: [3, 8],
  7: [8, 11],
  8: [30],
};
const COL_CLUES = {
  2: [23],
  3: [12, 3],
  4: [7, 9],
  5: [18, 4],
  6: [6, 8],
  7: [6, 9],
  8: [30],
};

const graph = cellGraph('9x9');
const cc = graph.makeOverlay('CC');
const shade = graph.makeOverlay('VS');
const shadeVar = shade.toVar('shaded cells');

// Every shade cell is SHADED or UNSHADED.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Rows/columns 1 and 9 have no outside clue: "If a row or column is
// unclued, there is no shading in that row or column."
const uncluedCells = [
  ...graph.row(1), ...graph.row(9),
  ...graph.column(1), ...graph.column(9),
];
const uncluedGivens = uncluedCells.map(cell => new Given(shade.at(cell), UNSHADED));

// Region-shade tie: scans [ccA, ccB, shadeA, shadeB] for one grid edge and
// rejects only if the two cells share a region label but differ in shade.
// `sameRegion` collapses to a boolean as soon as both labels are read, and
// `shadeA` is dropped again as soon as it is compared, so the compiled state
// stays small instead of carrying every raw (ccA, ccB, shadeA, shadeB)
// combination.
const tieSpec = {
  startState: { step: 0 },
  transition(state, value) {
    switch (state.step) {
      case 0: return { step: 1, ccA: value };
      case 1: return { step: 2, sameRegion: value === state.ccA };
      case 2: return state.sameRegion
        ? { step: 3, sameRegion: true, shadeA: value }
        : { step: 3, sameRegion: false };
      case 3: return { step: 4, ok: !state.sameRegion || state.shadeA === value };
    }
  },
  accept: (state) => state.step === 4 && state.ok,
  maxDepth: 4,
};
const tieNFA = NFA.encodeSpec(tieSpec, 9);

function gridEdges() {
  const edges = [];
  for (const cell of graph.cells()) {
    const right = graph.step(cell, 0, 1);
    if (right) edges.push([cell, right]);
    const down = graph.step(cell, 1, 0);
    if (down) edges.push([cell, down]);
  }
  return edges;
}

const regionShadeTies = gridEdges().map(([a, b]) => new NFA(
  tieNFA, 'region-shade tie', [cc.at(a), cc.at(b), shade.at(a), shade.at(b)]));

// Japanese-sum line NFA: scans [digit1, shade1, ..., digit9, shade9] and
// matches the maximal SHADED runs, in scan order, against `targets`.
function laneNFASpec(targets) {
  return NFA.encodeSpec({
    startState: { phase: 'digit', idx: 0, sum: 0, pending: undefined },
    transition(state, value) {
      if (state.phase === 'digit') {
        return { ...state, phase: 'shade', pending: value };
      }
      const { idx, sum, pending } = state;
      if (value === SHADED) {
        if (idx >= targets.length) return undefined;
        const cap = targets[idx] + 1;
        return { phase: 'digit', idx, sum: Math.min(sum + pending, cap) };
      }
      // UNSHADED: close any open run, which must match targets[idx] exactly.
      if (sum > 0) {
        if (idx >= targets.length || targets[idx] !== sum) return undefined;
        return { phase: 'digit', idx: idx + 1, sum: 0 };
      }
      return { phase: 'digit', idx, sum: 0 };
    },
    accept(state) {
      if (state.phase !== 'digit') return false;
      if (state.sum > 0) {
        return state.idx < targets.length && targets[state.idx] === state.sum &&
          state.idx + 1 === targets.length;
      }
      return state.idx === targets.length;
    },
    maxDepth: 18,
  }, 9);
}

const interleave = (cells) => {
  const shadeCells = shade.at(cells);
  return cells.flatMap((cell, i) => [cell, shadeCells[i]]);
};

const rowNFAs = Object.entries(ROW_CLUES).map(([row, targets]) => new NFA(
  laneNFASpec(targets), 'row Japanese sum', interleave(graph.row(+row))));
const colNFAs = Object.entries(COL_CLUES).map(([col, targets]) => new NFA(
  laneNFASpec(targets), 'col Japanese sum', interleave(graph.column(+col))));

// Hidden 3x3 magic square: an unplaced window, so a disjunction over every
// axis-aligned 3x3 placement. Each candidate is one EqualSum over its 3
// rows, 3 columns and 2 diagonals (8 segments of 3 cells); only sum equality
// is required, matching the stated rule exactly.
function windowSegments(r0, c0) {
  const cell = (r, c) => makeCellId(r, c);
  const rows = [0, 1, 2].map(dr => [0, 1, 2].map(dc => cell(r0 + dr, c0 + dc)));
  const cols = [0, 1, 2].map(dc => [0, 1, 2].map(dr => cell(r0 + dr, c0 + dc)));
  const diag1 = [0, 1, 2].map(d => cell(r0 + d, c0 + d));
  const diag2 = [0, 1, 2].map(d => cell(r0 + d, c0 + 2 - d));
  return [...rows, ...cols, diag1, diag2];
}

const magicWindows = [];
for (let r0 = 1; r0 <= 7; r0++) {
  for (let c0 = 1; c0 <= 7; c0++) {
    magicWindows.push(windowSegments(r0, c0));
  }
}
const magicSquare = new Or(magicWindows.map(segments => new EqualSum(...segments)));

return [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
  shadeVar,
  shadeDomain,
  ...uncluedGivens,
  ...regionShadeTies,
  ...rowNFAs,
  ...colNFAs,
  magicSquare,
];
