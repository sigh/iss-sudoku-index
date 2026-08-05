// Title: Quadruples Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=duoeYgKmwIo
// Source: https://tinyurl.com/yd7e72n8

// Standard Sudoku rules apply. Each white circle requires its printed digits,
// including multiplicities, in the surrounding 2x2 square.
// Givens transcribed from the grid.
const givens = [
  ['R1C8', 3], ['R3C3', 1], ['R7C7', 4], ['R9C2', 7],
];

// Quadruple circles transcribed from the drawn circles: [top-left cell, digits].
const quads = [
  ['R3C3', [2, 2]], ['R4C3', [3, 3]], ['R5C3', [4, 4]],
  ['R6C3', [5, 5]], ['R6C6', [6, 6]], ['R5C6', [7, 7]],
  ['R4C6', [8, 8]], ['R3C6', [9, 9]], ['R2C2', [2, 5, 8]],
  ['R1C1', [3, 6, 9]], ['R7C7', [3, 6, 9]], ['R8C8', [2, 5, 8]],
  ['R5C1', [5, 6]], ['R4C8', [2, 9]],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...quads.map(([topLeft, values]) => new Quad(topLeft, ...values)),
];
