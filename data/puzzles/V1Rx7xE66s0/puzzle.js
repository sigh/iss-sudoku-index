// Title: Geometry Exam #5
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=V1Rx7xE66s0
// Source: https://sudokupad.app/rms66f3qkn

// Normal Sudoku rules, both main diagonals, and standard arrows.
const arrows = [
  ['R6C1', 'R7C2', 'R8C3', 'R9C2'],
  ['R4C3', 'R3C2', 'R2C1', 'R1C2'],
  ['R3C4', 'R4C5', 'R5C6', 'R6C5'],
  ['R4C7', 'R3C8', 'R2C9', 'R1C8'],
  ['R6C8', 'R7C8', 'R8C9', 'R9C8'],
  ['R5C9', 'R4C9', 'R4C8'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...arrows,
];
