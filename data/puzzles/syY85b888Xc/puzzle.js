// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=syY85b888Xc
// Source: https://sudokupad.app/LFHbpFpN8r

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). No other clue geometry is drawn.

// Given digits, transcribed from the source payload's cell values, plus one
// externally corroborated given: a YouTube viewer comment on the video
// reports a 2 in the upper-left cell of box 2 (R1C4) that this SudokuPad
// recreation is missing; that cell was blank in the payload, and the
// payload's own embedded solution stub agrees (R1C4=2).
const givens = [
  ['R1C3', 5], ['R1C4', 2],
  ['R2C7', 7], ['R2C9', 1],
  ['R3C1', 9], ['R3C5', 5], ['R3C7', 8], ['R3C9', 3],
  ['R4C1', 1], ['R4C6', 5], ['R4C7', 6], ['R4C8', 9],
  ['R5C3', 9], ['R5C5', 3], ['R5C8', 1], ['R5C9', 5],
  ['R6C4', 9],
  ['R7C2', 4], ['R7C3', 6], ['R7C4', 1], ['R7C8', 3],
  ['R8C4', 4], ['R8C5', 6], ['R8C7', 5],
  ['R9C2', 3], ['R9C3', 2], ['R9C5', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
