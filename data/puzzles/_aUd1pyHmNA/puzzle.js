// Title: XY Difference Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=_aUd1pyHmNA
// Source: https://app.crackingthecryptic.com/sudoku/L8t8jQ7Ljn

// Normal sudoku rules apply. A diamond between two horizontally adjacent
// cells would mean the absolute difference of those two cells equals the
// first (leftmost) digit of that row; a diamond between two vertically
// adjacent cells would mean the absolute difference equals the first
// (topmost) digit of that column. All possible diamonds are given, and none
// are drawn anywhere in the grid -- so the absence is itself the constraint:
// every horizontally adjacent pair's absolute difference differs from its
// row's leftmost digit, and every vertically adjacent pair's absolute
// difference differs from its column's topmost digit. This is the
// "exhaustively marked clue" pattern: a global negative with no drawn marks
// to key off, so it is encoded as one automaton per row and per column
// rather than per-pair Pair constraints.

// One NFA scans a row (left to right) or column (top to bottom) of 9 cells.
// State holds `first` (the row/column's leading digit, fixed once the first
// cell is read) and `prev` (the digit most recently read). Each subsequent
// read checks the pair against `first`; a violating pair has no outgoing
// transition, which rejects that branch.
const diamondFreeSpec = NFA.encodeSpec({
  startState: { first: null, prev: null },
  transition: ({ first, prev }, value) => {
    if (first === null) return { first: value, prev: value };
    if (Math.abs(prev - value) === first) return undefined; // would-be diamond
    return { first, prev: value };
  },
  accept: () => true,
}, 9);

const rows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c)));
const cols = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c)));

const noHorizontalDiamonds = rows.map(
  (cells, i) => new NFA(diamondFreeSpec, `no-h-diamond-r${i + 1}`, ...cells));
const noVerticalDiamonds = cols.map(
  (cells, i) => new NFA(diamondFreeSpec, `no-v-diamond-c${i + 1}`, ...cells));

return [
  new Shape('9x9'),

  // givens
  new Given('R2C2', 2), new Given('R2C3', 5), new Given('R2C4', 9),
  new Given('R3C2', 6), new Given('R3C4', 5),
  new Given('R4C2', 9), new Given('R4C3', 4), new Given('R4C4', 6),
  new Given('R6C6', 5), new Given('R6C7', 6), new Given('R6C8', 9),
  new Given('R7C6', 3), new Given('R7C8', 6),
  new Given('R8C6', 7), new Given('R8C7', 4), new Given('R8C8', 3),

  ...noHorizontalDiamonds,
  ...noVerticalDiamonds,
];
