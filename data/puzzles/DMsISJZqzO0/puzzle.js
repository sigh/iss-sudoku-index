// Title: Wake Up!
// Author: Pete Craig
// Video: https://www.youtube.com/watch?v=DMsISJZqzO0
// Source: https://sudokupad.app/4mlp7jvob1

// Normal Sudoku rules apply. Each blue line has equal sums in its 3x3-box segments.
const regionSumLines = [
  ['R6C8', 'R5C7', 'R4C6', 'R3C7', 'R2C8'],
  ['R2C6', 'R3C5', 'R4C4', 'R3C3', 'R2C2'],
  ['R8C8', 'R7C7', 'R6C6', 'R7C5', 'R8C4'],
  ['R8C2', 'R7C3', 'R6C4', 'R5C3', 'R4C2'],
];

// Quadruple circles: each listed digit appears in the indicated surrounding 2x2 square.
const quadruples = [
  ['R7C2', 1, 2, 8, 9],
  ['R7C4', 3],
  ['R2C2', 2, 7],
  ['R2C5', 3, 4, 7, 8],
  ['R2C7', 1, 2, 3, 4],
  ['R5C7', 7, 9],
  ['R7C7', 2, 4, 5, 7],
];

return [
  new Shape('9x9'),
  ...regionSumLines.map((cells) => new RegionSumLine(...cells)),
  ...quadruples.map(([topLeft, ...values]) => new Quad(topLeft, ...values)),
];
