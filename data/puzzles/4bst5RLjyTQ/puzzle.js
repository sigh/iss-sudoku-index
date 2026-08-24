// Title: X Marks The Dots
// Author: twototenth
// Video: https://www.youtube.com/watch?v=4bst5RLjyTQ
// Source: https://app.crackingthecryptic.com/sudoku/m67L3GdtdG

// Normal sudoku rules apply (9x9, standard box regions, no givens).
// Cells separated by an X sum to 10; cells separated by a white dot are
// consecutive; cells separated by a black dot are in a 1:2 ratio. "Not all
// dots or Xs are given" means these are ordinary marks, not an exhaustive
// negative constraint: unmarked adjacent pairs are unrestricted, so no
// Strict* / AntiConsecutive variant applies.

// Marks are between orthogonally adjacent cells only; one instance per edge.
// Coordinates transcribed from the SudokuPad overlay geometry (edge marks,
// distinguished by fill colour: white fill = white dot, black fill = black
// dot, text "X" = X mark).

const whiteDots = [
  ['R2C1', 'R3C1'],
  ['R2C2', 'R2C3'],
  ['R3C2', 'R3C3'],
  ['R2C4', 'R2C5'],
  ['R1C9', 'R2C9'],
  ['R4C1', 'R4C2'],
  ['R5C1', 'R6C1'],
  ['R5C3', 'R6C3'],
  ['R7C1', 'R7C2'],
  ['R8C2', 'R8C3'],
  ['R9C2', 'R9C3'],
  ['R7C5', 'R8C5'],
  ['R4C5', 'R4C6'],
  ['R4C7', 'R4C8'],
  ['R3C9', 'R4C9'],
  ['R9C8', 'R9C9'],
  ['R5C7', 'R6C7'],
  ['R3C4', 'R4C4'],
];

const blackDots = [
  ['R1C6', 'R2C6'],
  ['R6C8', 'R6C9'],
  ['R7C7', 'R7C8'],
];

const xMarks = [
  ['R1C1', 'R1C2'],
  ['R1C4', 'R1C5'],
  ['R1C7', 'R1C8'],
  ['R5C2', 'R6C2'],
  ['R8C1', 'R9C1'],
  ['R8C6', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
];
