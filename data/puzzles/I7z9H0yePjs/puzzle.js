// Title: Four Triangles
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=I7z9H0yePjs
// Source: https://sudokupad.app/ei2pkdyk0w

// Normal Sudoku rules apply. On each drawn four-cell line, the first pair
// and the last pair have equal sums.

// The givens and line paths are transcribed from the drawn SudokuPad puzzle.
const givens = [
  ['R3C8', 6],
  ['R5C8', 5],
  ['R6C3', 8],
  ['R6C7', 2],
  ['R8C1', 2],
];

const lines = [
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R4C5', 'R3C5', 'R2C5', 'R1C5'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R1C6', 'R2C7', 'R3C8', 'R4C9'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R6C6', 'R7C6', 'R8C6', 'R9C6'],
  ['R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R6C4', 'R6C3', 'R6C2', 'R6C1'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4'],
];

const lineSums = lines.map(cells =>
  new EqualSum(cells.slice(0, 2), cells.slice(2)));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lineSums,
];
