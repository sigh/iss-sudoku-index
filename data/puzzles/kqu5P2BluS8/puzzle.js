// Title: Too Early 2!!
// Author: Panthera
// Video: https://www.youtube.com/watch?v=kqu5P2BluS8
// Source: https://app.crackingthecryptic.com/sudoku/2pT2ThFQ2r

// Rules encoded (from the video's description text):
// "Normal sudoku rules apply. Additionally, shade some cells such that the
// clues outside the grid indicate the sums of the digits in contiguous
// blocks of shaded cells in the respective row or column. Blocks have to be
// separated by at least one unshaded cell. ... There must be a 3x3 magic
// square completely in the shaded region of the correct solution. [A magic
// square contains no repeated digits and each of the three rows/columns and
// two main diagonals must sum to the same number.]"
//
// - Normal sudoku: the default Shape('9x9') rows/columns/3x3-box
//   all-different groups. The payload's own `regions` array is nine
//   standard-position 3x3 boxes, confirming no jigsaw variant.
// - Shading: a VS overlay (SHADED/UNSHADED), one Var per grid cell.
// - Outside sums: each clued row/column's outside numbers give, in order,
//   the digit sums of its maximal shaded runs (>=1 unshaded cell between
//   runs). Clue order is read farthest-from-grid first == first-run-to-
//   last-run order -- the same convention this author's other shaded-block
//   puzzle (QlzevsegHlo, "Chaos Power") uses and states is "not stated in
//   this puzzle's own text" either; verified here against a second,
//   differently-authored puzzle sharing this exact 12x12-canvas/9x9-active
//   template (r3killZw18w, "Cross The Sums"), whose token order was checked
//   programmatically against its own drawn overlay positions.
// - Every row and column of the 9x9 grid carries at least one outside clue
//   (unlike Chaos Power), so there is no unclued-line case to give.
// - Magic square: no stated position, so a disjunction over every one of the
//   49 axis-aligned 3x3 windows. Unlike Chaos Power's magic square, this
//   rule also states "no repeated digits" (AllDifferent) and requires the
//   window to sit "completely in the shaded region" (every cell SHADED),
//   both added on top of the shared 8-line EqualSum construction.

const SHADED = 1;
const UNSHADED = 2;

// Outside-clue lists, farthest-from-grid first (first shaded run to last),
// transcribed from the source's outside-clue overlays and given-style digit
// cells in the top (row<4) and left (col<4) margins. Distance-from-grid
// order was recovered from each mark's (row,col) position. Cross-check:
// row-clue total == col-clue total == 243, since every shaded cell's digit
// is counted once on each side.
const ROW_CLUES = {
  1: [17, 12],
  2: [5, 19, 5],
  3: [5, 31, 6],
  4: [15, 17],
  5: [15, 8],
  6: [37],
  7: [21],
  8: [20],
  9: [6, 4],
};
const COL_CLUES = {
  1: [7],
  2: [12, 15],
  3: [8, 21, 6],
  4: [42],
  5: [8, 14],
  6: [22, 17],
  7: [5, 21, 4],
  8: [11, 23],
  9: [7],
};

const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VS');
const shadeVar = shade.toVar('shaded cells');

// Every shade cell is SHADED or UNSHADED.
const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], SHADED, UNSHADED));

// Outside-sum line NFA: scans [digit1, shade1, ..., digit9, shade9] and
// matches the maximal SHADED runs, in scan order, against `targets` (already
// farthest-from-grid-first, i.e. first-run-to-last-run). A run's sum is
// clamped once it exceeds its target so the compiled state stays small;
// exactly `targets.length` runs must occur, no more, no fewer.
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
  laneNFASpec(targets), 'row outside sum', interleave(graph.row(+row))));
const colNFAs = Object.entries(COL_CLUES).map(([col, targets]) => new NFA(
  laneNFASpec(targets), 'col outside sum', interleave(graph.column(+col))));

// 3x3 magic square, position unstated: a disjunction over every axis-aligned
// 3x3 window. Each candidate requires its 9 cells all SHADED ("completely in
// the shaded region"), all-different ("no repeated digits" -- with a 3x3
// window and digits 1-9 this forces exactly one of each), and one EqualSum
// over its 3 rows, 3 columns and 2 diagonals ("each ... must sum to the same
// number"; with all-different 1-9 cells this number is forced to 45/3 = 15,
// but EqualSum states the rule directly without hard-coding that derived
// value).
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
    const segments = windowSegments(r0, c0);
    const cells = segments[0].concat(segments[1], segments[2]); // the 3 rows = all 9 cells
    magicWindows.push(new And([
      ...cells.map(c => new Given(shade.at(c), SHADED)),
      new AllDifferent(...cells),
      new EqualSum(...segments),
    ]));
  }
}
const magicSquare = new Or(magicWindows);

return [
  new Shape('9x9'),
  shadeVar,
  shadeDomain,
  ...rowNFAs,
  ...colNFAs,
  magicSquare,
];
