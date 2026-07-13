// Title: RAT RUN 29: Counterbalance
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=C59o3VPre2o
// Source: https://sudokupad.app/xipcvuhz9y

// Normal sudoku rules apply (standard 9x9 boxes, no givens).

// Purple arrows sit between two orthogonally adjacent cells and point to the
// smaller of the two digits (GreaterThan's first cell is the larger one).
const arrows = [
  ['R2C6', 'R3C6'],
  ['R8C4', 'R7C4'],
  ['R3C4', 'R3C5'],
];

// Redcurrants: the two digits have opposite parity (one odd, one even).
const redcurrantKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const redcurrants = [
  ['R1C1', 'R1C2'],
  ['R1C4', 'R2C4'],
  ['R3C9', 'R4C9'],
  ['R5C7', 'R6C7'],
  ['R7C2', 'R8C2'],
  ['R7C7', 'R7C8'],
  ['R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new GreaterThan(...cells)),
  ...redcurrants.map(cells => new Pair(redcurrantKey, 'redcurrant', ...cells)),
];
