// Title: Snailed It!
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/2zzeuuan

// Normal sudoku with given digits; no other constraints.

const givens = [
  ['R1C1', 1],
  ['R1C6', 7],
  ['R1C8', 9],
  ['R2C2', 7],
  ['R2C5', 2],
  ['R2C9', 8],
  ['R3C3', 9],
  ['R3C4', 8],
  ['R3C7', 5],
  ['R4C3', 5],
  ['R4C4', 3],
  ['R4C7', 9],
  ['R5C2', 1],
  ['R5C5', 8],
  ['R5C9', 4],
  ['R6C1', 6],
  ['R6C6', 4],
  ['R7C1', 3],
  ['R7C8', 1],
  ['R8C2', 4],
  ['R8C9', 7],
  ['R9C3', 7],
  ['R9C7', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
