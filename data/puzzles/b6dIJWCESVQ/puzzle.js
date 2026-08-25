// Title: Irregular Sudoku
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=b6dIJWCESVQ
// Source: https://sudokupad.app/tb6486Tqgg

// Rule: "Place the digits 1-9 in each row, column, and marked region
// without repeats." Rows and columns are the default 9x9 all-different
// groups; the 9 drawn regions are irregular (jigsaw), not 3x3 boxes, so the
// default boxes are dropped (NoBoxes) and each region is given explicitly
// (Jigsaw). No other clue types are present.

const regions = [
  ['R2C2', 'R2C3', 'R2C4', 'R3C4', 'R3C3', 'R3C2', 'R4C2', 'R4C3', 'R4C4'],
  ['R6C2', 'R6C3', 'R6C4', 'R7C4', 'R7C3', 'R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C8', 'R3C7', 'R3C6', 'R4C6', 'R4C7', 'R4C8'],
  ['R6C6', 'R6C7', 'R6C8', 'R7C8', 'R7C7', 'R7C6', 'R8C6', 'R8C7', 'R8C8'],
  ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C5', 'R1C6'],
  ['R3C5', 'R4C5', 'R5C5', 'R5C4', 'R5C3', 'R6C5', 'R7C5', 'R5C6', 'R5C7'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R5C8', 'R6C9'],
  ['R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R8C5', 'R9C4'],
  ['R4C1', 'R5C1', 'R5C2', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
];

const givens = [
  ['R1C4', 3], ['R2C2', 3], ['R2C3', 4], ['R2C8', 8], ['R3C2', 6],
  ['R3C3', 9], ['R3C7', 7], ['R4C1', 3], ['R4C4', 7], ['R4C6', 6],
  ['R5C5', 5], ['R6C4', 4], ['R6C6', 7], ['R6C9', 9], ['R7C3', 3],
  ['R7C7', 9], ['R7C8', 6], ['R8C2', 2], ['R8C7', 5], ['R8C8', 1],
  ['R9C1', 1], ['R9C6', 5],
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
