// Title: X Clone Sudoku
// Author: Eric Fox
// Video: https://www.youtube.com/watch?v=3IM60jSmV6Y
// Source: https://cracking-the-cryptic.web.app/sudoku/bf8tf8qgPT

// Standard 9x9 sudoku: 1-9 in every row, column and 3x3 box (the given
// regions are the nine default boxes). Digits cannot repeat along either main
// diagonal (Sudoku X). Two congruent 10-cell shaded regions are clones of
// each other: corresponding cells hold the same digit (Clone Sudoku).

const shape = new Shape('9x9');

// Clone pair cells: the two shaded 10-cell shapes are congruent, each pair
// below sharing the same relative offset within its shape.
const cloneCells = [
  ['R2C2', 'R5C6'],
  ['R2C3', 'R5C7'],
  ['R2C4', 'R5C8'],
  ['R3C4', 'R6C8'],
  ['R3C3', 'R6C7'],
  ['R3C2', 'R6C6'],
  ['R4C2', 'R7C6'],
  ['R4C3', 'R7C7'],
  ['R4C4', 'R7C8'],
  ['R5C3', 'R8C7'],
];

return [
  shape,

  // Givens.
  new Given('R1C3', 5), new Given('R1C7', 6), new Given('R1C8', 9),
  new Given('R2C9', 7),
  new Given('R3C1', 9), new Given('R3C5', 5), new Given('R3C9', 8),
  new Given('R4C1', 1), new Given('R4C5', 7), new Given('R4C7', 8),
  new Given('R6C3', 3), new Given('R6C5', 2), new Given('R6C9', 5),
  new Given('R7C1', 4), new Given('R7C5', 1), new Given('R7C9', 3),
  new Given('R8C1', 3),
  new Given('R9C2', 9), new Given('R9C3', 6), new Given('R9C7', 1),

  // Sudoku X: '\' diagonal R1C1-R9C9 and '/' diagonal R1C9-R9C1.
  new Diagonal(-1),
  new Diagonal(1),

  // Clone Sudoku: each corresponding pair of cells across the two shapes
  // holds the same digit.
  ...cloneCells.map(([a, b]) => new SameValues(2, a, b)),
];
