// Title: X-Sum Tree
// Author: Simon Trucchi
// Video: https://www.youtube.com/watch?v=kpdSd4tyXao
// Source: https://app.crackingthecryptic.com/sudoku/HNbtmnHtNL

// Standard 9x9 sudoku rules apply (default rows/columns/3x3 boxes).
//
// Outside clues: each shows the sum of the first X cells counted from that
// side, where X is the digit in the first (nearest) of those cells --
// encoded directly with XSum.
//
// Trio rule: a red cell together with its immediate left and right neighbours,
// and a blue cell together with its immediate above and below neighbours,
// each form a trio of three digits where one equals the sum of the other two.
// The rule names the relation (X+Y=Z) without saying which of the three cells
// plays Z, so all three ways of picking the "sum" cell are permitted (see
// `trio` below).
//
// Count rule: every digit 1-9 appears the same number of times among the
// green-shaded cells as among the white (unshaded) cells; the red/blue cells
// are neither green nor white and are not part of this count. Both groups
// have 36 cells, so this is one balance check per digit (see `digitBalance`
// below).

const geometry = cellGeometry('9x9');

// Outside X-Sum clue cells, nearest-cell-first, transcribed from the drawn
// clue lanes (top of column 3, left of row 6, right of rows 2 and 7).
const lineCells = (axis, index, direction) => Array.from({ length: 9 }, (_, offset) => (
  axis === 'C'
    ? makeCellId(direction > 0 ? offset + 1 : 9 - offset, index)
    : makeCellId(index, direction > 0 ? offset + 1 : 9 - offset)
));
const xSums = [
  XSum.fromCells(20, lineCells('C', 3, 1), geometry),   // top, column 3, downward
  XSum.fromCells(20, lineCells('R', 6, 1), geometry),   // left, row 6, rightward
  XSum.fromCells(25, lineCells('R', 2, -1), geometry),  // right, row 2, leftward
  XSum.fromCells(12, lineCells('R', 7, -1), geometry),  // right, row 7, leftward
];

// A trio is three cells where one digit equals the sum of the other two;
// the rule does not fix which cell is the sum, so try all three pairings.
// Each pairing is an EqualSum between the two-cell segment and the
// remaining single cell.
function trio(a, b, c) {
  return new Or([
    new EqualSum([a, b], [c]), // a + b = c
    new EqualSum([a, c], [b]), // a + c = b
    new EqualSum([b, c], [a]), // b + c = a
  ]);
}

// Red cells (drawn red-shaded squares); trio = the cell plus its left/right
// neighbours.
const redCells = ['R4C4', 'R4C6', 'R6C5', 'R8C2', 'R8C8'];
const redTrios = redCells.map((cellId) => {
  const { row, col } = parseCellId(cellId);
  return trio(makeCellId(row, col - 1), cellId, makeCellId(row, col + 1));
});

// Blue cells (drawn blue-shaded squares); trio = the cell plus its
// above/below neighbours.
const blueCells = ['R2C5', 'R6C3', 'R6C7', 'R8C5'];
const blueTrios = blueCells.map((cellId) => {
  const { row, col } = parseCellId(cellId);
  return trio(makeCellId(row - 1, col), cellId, makeCellId(row + 1, col));
});

// Green cells (drawn green-shaded squares, the tree's foliage) and white
// cells (every remaining unshaded cell -- red/blue cells excluded).
const greenCells = [
  'R1C5', 'R2C4', 'R2C6', 'R3C4', 'R3C5', 'R3C6', 'R4C3', 'R4C5', 'R4C7',
  'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C2', 'R6C4',
  'R6C6', 'R6C8', 'R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
  'R7C8', 'R7C9', 'R8C1', 'R8C3', 'R8C4', 'R8C6', 'R8C7', 'R8C9', 'R9C5',
];
const whiteCells = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C6', 'R1C7', 'R1C8', 'R1C9',
  'R2C1', 'R2C2', 'R2C3', 'R2C7', 'R2C8', 'R2C9',
  'R3C1', 'R3C2', 'R3C3', 'R3C7', 'R3C8', 'R3C9',
  'R4C1', 'R4C2', 'R4C8', 'R4C9',
  'R5C1', 'R5C9',
  'R6C1', 'R6C9',
  'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

// One NFA per digit: scan every green cell then every white cell
// (SEGMENT_BREAK between), tracking (count in green so far) - (count in
// white so far) for that digit, accepting only when the final difference is
// zero. Both groups are exactly 36 cells, so the true difference never
// leaves [-36, 36]; the state is compiled generically (it does not know the
// actual cell-array lengths), so the counter is clamped one past that true
// bound to keep the reachable state count finite -- real 36-cell scans never
// reach the clamp.
const DIFF_BOUND = 37;
const clampDiff = (diff) => Math.max(-DIFF_BOUND, Math.min(DIFF_BOUND, diff));
function digitBalance(digit) {
  const spec = NFA.encodeSpec({
    startState: { phase: 'green', diff: 0 },
    transition: ({ phase, diff }, value) => {
      if (value === SEGMENT_BREAK) return { phase: 'white', diff };
      if (value !== digit) return { phase, diff };
      return { phase, diff: clampDiff(phase === 'green' ? diff + 1 : diff - 1) };
    },
    accept: ({ diff }) => diff === 0,
  }, 9, { multiSegment: true });
  return new NFA(spec, `balance${digit}`, greenCells, whiteCells);
}
const digitBalances = Array.from({ length: 9 }, (_, i) => digitBalance(i + 1));

return [
  new Shape('9x9'),

  new Given('R2C5', 6),
  new Given('R4C4', 9),
  new Given('R4C6', 5),
  new Given('R6C3', 2),
  new Given('R6C7', 8),
  new Given('R8C2', 7),
  new Given('R8C5', 4),
  new Given('R8C8', 1),

  ...xSums,
  ...redTrios,
  ...blueTrios,
  ...digitBalances,
];
