// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Nge6MqHg4MM
// Source: https://sudokupad.app/6jFtNj83pm

// Standard 9x9 sudoku: each row, column, and 3x3 box contains 1-9 once.
// The payload's `metadata.rules` says only "Normal sudoku rules apply."; the
// `regions` array lists the standard nine 3x3 boxes, so no NoBoxes/RegionSize
// override is needed. No cages, lines, or other clue geometry are drawn.

const givens = [
  ['R1C2', 6], ['R1C3', 1], ['R1C4', 5], ['R1C8', 3],
  ['R2C1', 7], ['R2C5', 3], ['R2C8', 4],
  ['R3C7', 5], ['R3C9', 9],
  ['R4C2', 4], ['R4C3', 5], ['R4C6', 2], ['R4C8', 9],
  ['R5C5', 4],
  ['R6C2', 2], ['R6C4', 6], ['R6C7', 3], ['R6C8', 1],
  ['R7C1', 3], ['R7C3', 2],
  ['R8C2', 9], ['R8C5', 6], ['R8C9', 1],
  ['R9C2', 7], ['R9C6', 9], ['R9C7', 4], ['R9C8', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
