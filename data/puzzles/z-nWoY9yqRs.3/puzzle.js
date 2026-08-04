// Title: April 10, 2023: Hashtag Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=z-nWoY9yqRs
// Source: https://tinyurl.com/y8wvpf94
//
// Normal sudoku rules apply (rows, columns, standard 3x3 boxes). Also, each
// of the four diagonal blue lines contains the digits 1-9 exactly once each.
//
// The four blue lines are drawn as staircase diagonals (shift one row/col
// every three cells), not cell-to-cell diagonals; cell lists below are
// transcribed from the drawn overlay geometry. Two lines cross each other's
// cells (e.g. R4C4, R6C4), which is expected for a self-intersecting drawn
// shape -- each line is still its own AllDifferent group of 9 cells.

const givens = [
  new Given('R1C2', 4), new Given('R1C3', 9), new Given('R1C4', 5),
  new Given('R1C5', 1), new Given('R1C6', 6), new Given('R1C7', 2),
  new Given('R4C5', 8), new Given('R4C6', 9), new Given('R4C7', 1),
  new Given('R4C8', 2), new Given('R4C9', 3),
  new Given('R6C1', 1), new Given('R6C2', 2), new Given('R6C3', 3),
  new Given('R6C4', 4), new Given('R6C5', 5),
  new Given('R9C3', 2), new Given('R9C4', 9), new Given('R9C5', 3),
  new Given('R9C6', 5), new Given('R9C7', 4), new Given('R9C8', 6),
];

const hashtagLines = [
  ['R1C5', 'R2C5', 'R3C5', 'R4C4', 'R5C4', 'R6C4', 'R7C3', 'R8C3', 'R9C3'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C6', 'R5C6', 'R6C6', 'R7C5', 'R8C5', 'R9C5'],
  ['R3C1', 'R3C2', 'R3C3', 'R4C4', 'R4C5', 'R4C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R5C1', 'R5C2', 'R5C3', 'R6C4', 'R6C5', 'R6C6', 'R7C7', 'R7C8', 'R7C9'],
].map(cells => new AllDifferent(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...hashtagLines,
];
