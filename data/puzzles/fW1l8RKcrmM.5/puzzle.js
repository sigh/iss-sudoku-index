// Title: Antiquing
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=fW1l8RKcrmM
// Source: https://tinyurl.com/msn5atyb

// Normal sudoku rules apply. Cells that are a chess king's move apart must
// not contain the same digit (anti-king), via the built-in AntiKing global.

// Givens transcribed from the drawn grid (row-major, 1-indexed cells).
const givens = [
  ['R2C3', 8], ['R2C6', 6], ['R2C9', 4],
  ['R3C2', 1], ['R3C3', 5], ['R3C5', 2], ['R3C6', 9], ['R3C8', 3], ['R3C9', 6],
  ['R5C3', 6], ['R5C6', 4], ['R5C9', 8],
  ['R6C2', 2], ['R6C3', 4], ['R6C5', 3], ['R6C6', 8], ['R6C8', 1], ['R6C9', 9],
  ['R8C3', 2], ['R8C6', 1], ['R8C9', 7],
  ['R9C2', 7], ['R9C3', 9], ['R9C5', 4], ['R9C6', 3], ['R9C8', 2], ['R9C9', 1],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new AntiKing(),
];
