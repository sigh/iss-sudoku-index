// Title: Sep 9, 2022: Killer Quadruples
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=szxjqhP6_uc
// Source: https://tinyurl.com/33xz86kx

// Normal sudoku rules. Four killer cages: digits cannot repeat within a cage
// and must sum to the given total. Ten quadruple circles: each lists digits
// that must all appear among its four surrounding cells (`Quad` takes the
// top-left cell of the 2x2 block).

const cages = [
  [21, 'R3C3', 'R3C4', 'R4C3', 'R4C4', 'R5C3', 'R5C4'],
  [22, 'R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [21, 'R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R2C8'],
  [22, 'R8C2', 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
];

const quads = [
  ['R3C3', 1, 2, 3, 4],
  ['R6C6', 1, 2, 3, 5],
  ['R8C2', 1, 2, 3, 4],
  ['R1C7', 1, 2, 3, 5],
  ['R7C4', 3, 4, 5, 6],
  ['R2C5', 5, 6, 7, 8],
  ['R6C1', 2, 4, 6, 8],
  ['R3C8', 1, 2, 4, 8],
  ['R7C8', 1, 3, 5, 9],
  ['R2C1', 1, 3, 4, 6],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...quads.map(([cell, ...values]) => new Quad(cell, ...values)),
];
