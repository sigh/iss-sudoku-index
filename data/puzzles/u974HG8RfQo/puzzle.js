// Title: VXX - XVX - XXV
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=u974HG8RfQo
// Source: https://sudokupad.app/NmMBndq3mM

// Standard sudoku (default 9x9 boxes). Ten two-cell killer cages (distinct
// digits, sum to the printed total). Nine V/X markers, one per box, each
// constraining only the marked adjacent pair (V = sum 5, X = sum 10); rules
// text explicitly disclaims any negative inference on unmarked pairs, so no
// StrictXV is added.

const cages = [
  [14, 'R3C1', 'R4C1'],
  [7, 'R3C3', 'R4C3'],
  [7, 'R3C4', 'R4C4'],
  [12, 'R3C7', 'R4C7'],
  [7, 'R6C1', 'R7C1'],
  [13, 'R6C2', 'R7C2'],
  [7, 'R6C4', 'R7C4'],
  [6, 'R6C7', 'R7C7'],
  [10, 'R6C9', 'R7C9'],
  [9, 'R9C6', 'R9C7'],
];

const vEdges = [
  ['R2C2', 'R2C3'],
  ['R5C5', 'R5C6'],
  ['R8C8', 'R8C9'],
];

const xEdges = [
  ['R2C5', 'R2C6'],
  ['R2C8', 'R2C9'],
  ['R5C2', 'R5C3'],
  ['R5C8', 'R5C9'],
  ['R8C2', 'R8C3'],
  ['R8C5', 'R8C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...vEdges.map((cells) => new V(...cells)),
  ...xEdges.map((cells) => new X(...cells)),
];
