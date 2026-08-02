// Title: Everything in its Right Place
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=Cb-HAH8lLkU
// Source: https://sudokupad.app/pTPD72D9qP

// Normal Sudoku rules apply. The three drawn cages sum to their labels, and
// each drawn V joins two adjacent digits summing to 5. The three solver-drawn
// snakes and all their path and digit rules are omitted.
const cages = [
  [9, 'R2C1', 'R3C1'],
  [15, 'R4C5', 'R5C5'],
  [9, 'R8C7', 'R9C7', 'R9C8'],
];
const vs = [
  ['R1C9', 'R2C9'],
  ['R2C8', 'R3C8'],
  ['R4C3', 'R4C4'],
  ['R7C4', 'R8C4'],
  ['R8C5', 'R9C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...vs.map(cells => new V(...cells)),
];
