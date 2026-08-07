// Title: Floating Through Space
// Author: gdc
// Video: https://www.youtube.com/watch?v=iPVL06VmAr8
// Source: https://sudokupad.app/3cnbyztbq0
//
// Chaos Construction: place 1-7 in every row, column and (solver-discovered,
// orthogonally connected, size-7) region -- ChaosConstruction() + the CC
// region-label overlay.
//
// Cave: the digit in each diamond-marked cell equals 1 plus the number of
// same-region cells it sees along its row and column, where sight in a
// direction stops at the first cell of a different region (or the grid
// edge). One NFA per diamond: the marked cell's own digit sets the target
// count, its own CC label sets the region to match, then each of the four
// direction rays (as CC labels) is scanned, accumulating a run that stops
// counting (but keeps consuming) once it hits a non-matching label.
//
// Up To N Sums / Regions: each outside clue is pinned to its own row/column
// number N (not solver-discovered -- N is the clue's own lane index). One
// NFA per clue scans the lane from the clue's side, interleaving each
// cell's digit and CC label: cells before the one holding digit N accumulate
// into the sum and must share one CC label; the N-cell's own CC label must
// then differ from that shared label. Diamonds and outside-clue lanes below
// are listed with the drawn shape or text position they come from.

const graph = cellGraph('7x7');
const cc = graph.makeOverlay('CC');

// Diamond-marked cells (4 rotated-square shapes drawn on the board).
const CAVE_CELLS = ['R1C2', 'R1C4', 'R5C4', 'R7C3'];

// Outside clues (numbers drawn against the framed board's sides). N is
// always the clue's own row/column number.
const OUTSIDE_CLUES = [
  { side: 'left', line: 3, n: 3, total: 7 },
  { side: 'left', line: 6, n: 6, total: 10 },
  { side: 'right', line: 1, n: 1, total: 15 },
  { side: 'right', line: 5, n: 5, total: 11 },
  { side: 'right', line: 7, n: 7, total: 18 },
  { side: 'top', line: 3, n: 3, total: 7 },
  { side: 'top', line: 6, n: 6, total: 14 },
];

// The four orthogonal directions as (dRow, dCol) steps.
const DIRECTIONS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

// NFA: a diamond's digit == 1 + count of own-region cells it sees.
// Segments: [digit], [own CC label], then one segment per direction's ray
// of CC labels (nearest cell first). `target` and `refLabel` are set by the
// first two one-cell segments; `count` accumulates matching-label ray cells
// until the first mismatch blocks that ray (`blocked`, reset each segment).
const caveSpec = NFA.encodeSpec({
  startState: { target: null, refLabel: null, count: 0, blocked: false },
  transition: ({ target, refLabel, count, blocked }, value) => {
    // A SEGMENT_BREAK falls between every pair of segments -- including the
    // two single-cell ones -- so it must be checked before either "consume
    // this symbol" branch, not just before the ray-scanning logic.
    if (value === SEGMENT_BREAK) return { target, refLabel, count, blocked: false };
    if (target === null) return { target: value, refLabel, count, blocked };
    if (refLabel === null) return { target, refLabel: value, count, blocked };
    if (blocked) return { target, refLabel, count, blocked };
    if (value === refLabel) {
      // Clamp at target: once count can only fail, stop climbing.
      return { target, refLabel, count: Math.min(count + 1, target), blocked };
    }
    return { target, refLabel, count, blocked: true };
  },
  accept: ({ target, refLabel, count }) =>
    target !== null && refLabel !== null && count === target - 1,
}, 7, { multiSegment: true });

const caveClues = CAVE_CELLS.map(cell => new NFA(
  caveSpec, 'Cave',
  [cell], [cc.at(cell)],
  ...DIRECTIONS.map(([dr, dc]) => cc.at(graph.ray(cell, dr, dc).slice(1))),
));

// NFA: sum of digits before the N-cell == total, and those cells (if any)
// share one CC label that the N-cell's own label must differ from. Scans one
// flat, interleaved [digit, ccLabel, digit, ccLabel, ...] segment in lane
// order. `pendingIsN` remembers, while awaiting a cc symbol, whether the
// digit just read was N (needs a "differs" check) or a prefix cell (needs a
// "same as the others" check). `trailing` marks that the N-cell has already
// been validated, so later lane cells are consumed without effect.
function upToNSumSpec(n, total) {
  return NFA.encodeSpec({
    startState: {
      sum: 0, regionLabel: null, foundN: false, trailing: false,
      expectCC: false, pendingIsN: false,
    },
    transition: (state, value) => {
      const { sum, regionLabel, foundN, trailing, expectCC, pendingIsN } = state;
      if (!expectCC) {
        if (trailing) return { ...state, expectCC: true };
        if (value === n) {
          return { sum, regionLabel, foundN: true, trailing, expectCC: true, pendingIsN: true };
        }
        // Clamp: total + 1 is a sink meaning "already too many".
        const newSum = Math.min(sum + value, total + 1);
        return { sum: newSum, regionLabel, foundN, trailing, expectCC: true, pendingIsN: false };
      }
      if (trailing) return { ...state, expectCC: false };
      if (pendingIsN) {
        if (regionLabel !== null && value === regionLabel) return undefined;
        return { sum, regionLabel, foundN, trailing: true, expectCC: false, pendingIsN: false };
      }
      if (regionLabel === null) {
        return { sum, regionLabel: value, foundN, trailing, expectCC: false, pendingIsN: false };
      }
      if (value !== regionLabel) return undefined;
      return { sum, regionLabel, foundN, trailing, expectCC: false, pendingIsN: false };
    },
    accept: ({ sum, foundN }) => foundN && sum === total,
  }, 7);
}

function laneCells({ side, line }) {
  if (side === 'left') return graph.row(line);
  if (side === 'right') return [...graph.row(line)].reverse();
  if (side === 'top') return graph.column(line);
  return [...graph.column(line)].reverse(); // 'bottom'
}

const outsideClues = OUTSIDE_CLUES.map(clue => new NFA(
  upToNSumSpec(clue.n, clue.total), 'UpToNSum',
  laneCells(clue).flatMap(cell => [cell, cc.at(cell)]),
));

return [
  new Shape('7x7'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...caveClues,
  ...outsideClues,
];
