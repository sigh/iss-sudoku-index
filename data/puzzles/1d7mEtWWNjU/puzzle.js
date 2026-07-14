// Title: Carnival
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=1d7mEtWWNjU
// Source: https://sudokupad.app/2hn8xg3p9b
//
// Normal sudoku rules, standard 3x3 boxes, no given digits.
//
// Killer cages: digits in a cage do not repeat and sum to the given total.

const cages = [
  [8, 'R3C2', 'R4C1', 'R4C2'],
  [8, 'R3C5', 'R4C4', 'R4C5'],
  [11, 'R3C8', 'R4C7', 'R4C8'],
  [11, 'R6C5', 'R7C4', 'R7C5'],
  [8, 'R6C8', 'R7C7', 'R7C8'],
  [8, 'R6C2', 'R7C1', 'R7C2'],
  [22, 'R1C3', 'R2C3', 'R2C4'],
  [22, 'R1C6', 'R2C6', 'R2C7'],
  [20, 'R9C6', 'R9C7', 'R9C8'],
  [13, 'R9C2', 'R9C3', 'R9C4'],
];

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
