// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=TvAu7UjGWGA
// Source: https://sudokupad.app/hTmNgdNbdt

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). No other clue geometry is drawn.

// Given digits, transcribed from the source payload's cell values.
const givens = [
  ['R1C3', 4], ['R1C9', 9],
  ['R2C4', 7], ['R2C8', 3],
  ['R3C1', 8], ['R3C5', 4], ['R3C7', 5],
  ['R4C2', 9], ['R4C4', 6], ['R4C9', 7],
  ['R5C3', 8], ['R5C6', 3],
  ['R6C5', 9], ['R6C7', 6], ['R6C8', 2],
  ['R7C3', 3], ['R7C6', 4], ['R7C8', 5],
  ['R8C2', 2], ['R8C6', 6], ['R8C7', 7], ['R8C8', 9], ['R8C9', 8],
  ['R9C1', 9], ['R9C4', 1], ['R9C8', 6],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
