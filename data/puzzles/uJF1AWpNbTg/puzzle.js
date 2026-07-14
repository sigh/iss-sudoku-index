// Title: Magic 5
// Author: Olive
// Video: https://www.youtube.com/watch?v=uJF1AWpNbTg
// Source: https://sudokupad.app/wsu6gvu952

// Normal sudoku rules, standard 3x3 boxes. One given digit at the centre.
//
// Killer cages: digits in a cage do not repeat and sum to the given total.
// Nine dominoes sum to 10; the centre 3-cell strip sums to 12.
//
// Purple lines: digits along a purple line form a set of consecutive digits
// in any order (Renban).

const cages = [
  [10, 'R2C4', 'R3C4'],
  [10, 'R2C6', 'R3C6'],
  [10, 'R4C2', 'R4C3'],
  [10, 'R4C7', 'R4C8'],
  [12, 'R4C5', 'R5C5', 'R6C5'],
  [10, 'R5C4', 'R6C4'],
  [10, 'R6C2', 'R6C3'],
  [10, 'R6C7', 'R6C8'],
  [10, 'R7C4', 'R8C4'],
  [10, 'R7C6', 'R8C6'],
];

const renbanLines = [
  ['R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8'],
  ['R9C3', 'R9C2', 'R9C1', 'R8C1'],
  ['R3C4', 'R4C5'],
  ['R5C4', 'R4C3'],
  ['R8C2', 'R7C1'],
  ['R2C8', 'R3C9'],
  ['R2C3', 'R2C2', 'R3C2'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
];
