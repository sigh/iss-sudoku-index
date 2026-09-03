// Title: Sept. 14, 2022: Entropy Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=TRnCrYmrLZ8
// Source: https://tinyurl.com/hp9tyrb3

// Normal sudoku rules apply. Each 2x2 square of cells must contain at least
// one low digit (123), at least one medium digit (456), and at least one high
// digit (789). GlobalEntropy applies that band requirement to every one of the
// 64 overlapping 2x2 squares of the grid, matching "each 2x2 square of cells".

// Givens, transcribed from the 20 clue digits printed in the grid.
const givens = [
  ['R1C2', 2], ['R1C8', 7],
  ['R2C1', 1], ['R2C3', 5], ['R2C7', 2], ['R2C9', 8],
  ['R3C2', 4], ['R3C4', 5], ['R3C8', 1],
  ['R4C7', 1],
  ['R6C3', 7],
  ['R7C2', 9], ['R7C6', 5], ['R7C8', 6],
  ['R8C1', 5], ['R8C3', 8], ['R8C7', 4], ['R8C9', 1],
  ['R9C2', 6], ['R9C8', 2],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new GlobalEntropy(),
];
