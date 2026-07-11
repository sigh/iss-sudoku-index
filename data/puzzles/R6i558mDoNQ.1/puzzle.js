// Title: Anti-Curse
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/yvpbwbk7

// Normal sudoku with given digits; no other constraints.

const givens = [
  ['R1C7', 9],
  ['R2C3', 1],
  ['R2C4', 2],
  ['R2C8', 5],
  ['R3C2', 2],
  ['R3C3', 7],
  ['R3C5', 1],
  ['R3C9', 3],
  ['R4C2', 1],
  ['R4C4', 6],
  ['R4C5', 2],
  ['R5C3', 2],
  ['R5C4', 1],
  ['R5C6', 3],
  ['R5C7', 4],
  ['R6C5', 4],
  ['R6C6', 5],
  ['R6C8', 3],
  ['R7C1', 1],
  ['R7C5', 3],
  ['R7C7', 8],
  ['R7C8', 4],
  ['R8C2', 6],
  ['R8C6', 4],
  ['R8C7', 3],
  ['R9C3', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
