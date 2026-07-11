// Title: Four Leaf Clover
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=oVFrx5oJdYo
// Source: https://sudokupad.app/76p1fymv2s

// Normal sudoku rules apply.
// Any sequence of four cells along the thinner purple lines must contain a
// run of four consecutive digits, in any order, without repeats.
// The thicker red line contains a set of consecutive digits in any order.
// Cells separated by a white dot marked V sum to 5.
// Cells separated by a white dot marked X sum to 10.
// Not all possible Xs and Vs are necessarily given.

// The four purple "leaves" (8 cells each) and the purple "stem" (5 cells)
// are each modelled as overlapping 4-cell Renban windows, one per
// consecutive quadruple along the drawn line.
const purpleLeafBottomLeft = [
  ['R6C4', 'R5C3', 'R5C2', 'R6C1'],
  ['R5C3', 'R5C2', 'R6C1', 'R7C1'],
  ['R5C2', 'R6C1', 'R7C1', 'R8C2'],
  ['R6C1', 'R7C1', 'R8C2', 'R8C3'],
  ['R7C1', 'R8C2', 'R8C3', 'R7C4'],
];

const purpleLeafBottomRight = [
  ['R6C6', 'R5C7', 'R5C8', 'R6C9'],
  ['R5C7', 'R5C8', 'R6C9', 'R7C9'],
  ['R5C8', 'R6C9', 'R7C9', 'R8C8'],
  ['R6C9', 'R7C9', 'R8C8', 'R8C7'],
  ['R7C9', 'R8C8', 'R8C7', 'R7C6'],
];

const purpleLeafTopLeft = [
  ['R4C3', 'R4C2', 'R3C1', 'R2C1'],
  ['R4C2', 'R3C1', 'R2C1', 'R1C2'],
  ['R3C1', 'R2C1', 'R1C2', 'R1C3'],
  ['R2C1', 'R1C2', 'R1C3', 'R2C4'],
  ['R1C2', 'R1C3', 'R2C4', 'R3C4'],
];

const purpleLeafTopRight = [
  ['R3C6', 'R2C6', 'R1C7', 'R1C8'],
  ['R2C6', 'R1C7', 'R1C8', 'R2C9'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
  ['R1C8', 'R2C9', 'R3C9', 'R4C8'],
  ['R2C9', 'R3C9', 'R4C8', 'R4C7'],
];

const purpleStem = [
  ['R5C5', 'R6C5', 'R7C5', 'R8C5'],
  ['R6C5', 'R7C5', 'R8C5', 'R9C5'],
];

const purpleWindows = [
  ...purpleLeafBottomLeft,
  ...purpleLeafBottomRight,
  ...purpleLeafTopLeft,
  ...purpleLeafTopRight,
  ...purpleStem,
];

// The thicker red line: a single 4-cell consecutive set (order-free).
const redLineCells = ['R1C4', 'R2C5', 'R3C5', 'R1C6'];

const vPairs = [
  ['R3C1', 'R3C2'],
  ['R5C7', 'R5C8'],
  ['R7C2', 'R7C3'],
  ['R8C3', 'R9C3'],
  ['R8C5', 'R9C5'],
];

const xPairs = [
  ['R8C8', 'R9C8'],
  ['R2C2', 'R3C2'],
];

return [
  new Shape('9x9'),

  ...purpleWindows.map(cells => new Renban(...cells)),
  new Renban(...redLineCells),

  ...vPairs.map(cells => new V(...cells)),
  ...xPairs.map(cells => new X(...cells)),
];
