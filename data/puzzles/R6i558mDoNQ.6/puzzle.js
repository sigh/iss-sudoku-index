// Title: 3/30: The Art of Goodliffing
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=R6i558mDoNQ
// Source: https://tinyurl.com/krbbjhd3

const givens = [
  ['R1C1', 1],
  ['R1C4', 2],
  ['R2C1', 4],
  ['R2C3', 5],
  ['R5C1', 3],
  ['R5C9', 7],
  ['R8C7', 5],
  ['R8C9', 6],
  ['R9C6', 9],
  ['R9C9', 8],
];

const thermos = [
  ['R8C3', 'R7C2', 'R6C1', 'R5C2', 'R4C3', 'R3C4'],
  ['R4C2', 'R3C3', 'R2C4', 'R3C5', 'R4C4', 'R5C3'],
  ['R2C7', 'R3C8', 'R4C9', 'R5C8', 'R6C7', 'R7C6'],
  ['R6C8', 'R7C7', 'R8C6', 'R7C5', 'R6C6', 'R5C7'],
  ['R4C8', 'R3C7', 'R2C6', 'R1C7', 'R2C8', 'R3C9'],
  ['R6C2', 'R7C3', 'R8C4', 'R9C3', 'R8C2', 'R7C1'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...thermos.map(line => new Thermo(...line)),
];
