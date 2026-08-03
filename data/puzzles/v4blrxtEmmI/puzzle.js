// Title: Computer-Generated Sudoku
// Author: Some App
// Video: https://www.youtube.com/watch?v=v4blrxtEmmI
// Source: https://app.crackingthecryptic.com/sudoku/8jrLJ3QBF8

// Normal sudoku rules apply. Standard 3x3 box regions; no cages, lines,
// arrows, or other overlays are present in the payload.

// Givens are transcribed from the raw SudokuPad payload's `cells` array.
const givens = [
  ['R1C1', 5], ['R1C3', 3], ['R1C6', 7], ['R1C7', 6],
  ['R2C1', 9], ['R2C4', 1], ['R2C8', 2],
  ['R3C9', 9],
  ['R4C2', 4], ['R4C4', 3], ['R4C5', 7], ['R4C7', 1],
  ['R5C1', 7], ['R5C2', 9], ['R5C4', 2], ['R5C6', 1],
  ['R6C2', 5], ['R6C5', 6],
  ['R7C5', 1], ['R7C8', 7], ['R7C9', 3],
  ['R8C1', 4], ['R8C2', 6],
  ['R9C6', 9], ['R9C9', 5],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
