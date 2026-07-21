// Title: The Mismatch
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=AubFOPHxEJQ
// Source: https://sudokupad.app/2301tf6q1e

const givens = [
  ['R1C4', 4], ['R2C5', 5], ['R4C2', 4], ['R4C9', 5],
  ['R6C1', 5], ['R6C7', 4], ['R7C6', 5], ['R9C6', 4],
].map(([cell, value]) => new Given(cell, value));

const cages = [
  [8, 'R4C6', 'R4C7'],
  [3, 'R6C3', 'R6C4'],
  [16, 'R7C4', 'R8C4'],
  [12, 'R7C2', 'R7C3', 'R8C2', 'R8C3'],
  [15, 'R2C7', 'R2C8', 'R3C7', 'R3C8'],
  [15, 'R1C1', 'R1C2', 'R2C1'],
  [20, 'R8C9', 'R9C8', 'R9C9'],
].map(([sum, ...cells]) => new Cage(sum, ...cells));

// Corresponding positions in the two gray 2x2 regions are equal.
const clonePairs = [
  ['R2C2', 'R7C7'],
  ['R2C3', 'R7C8'],
  ['R3C2', 'R8C7'],
  ['R3C3', 'R8C8'],
].map(cells => new SameValues(2, ...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...cages,
  ...clonePairs,
];
