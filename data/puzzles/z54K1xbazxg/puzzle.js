// Title: Lynx
// Author: Blobz
// Video: https://www.youtube.com/watch?v=z54K1xbazxg
// Source: https://sudokupad.app/blobz/lynx

// Normal sudoku rules apply. Both marked diagonals (top-left to
// bottom-right, and top-right to bottom-left) have no repeated digits.
// Six double-arrow lines each carry a circle at both ends; the sum of the
// two circled digits equals the sum of the digits on the rest of the line.

const givens = [
  ['R2C9', 8],
  ['R3C1', 3],
  ['R4C5', 2],
  ['R5C3', 8],
  ['R5C7', 7],
  ['R6C5', 1],
  ['R8C7', 1],
];

const doubleArrowPaths = [
  ['R1C3', 'R2C2', 'R3C1', 'R4C1', 'R5C2', 'R6C1', 'R7C1', 'R8C2', 'R9C3'],
  ['R1C7', 'R2C8', 'R3C9', 'R4C9', 'R5C8', 'R6C9', 'R7C9', 'R8C8', 'R9C7'],
  ['R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6'],
  ['R7C4', 'R6C4', 'R5C4', 'R4C4', 'R3C4'],
  ['R3C5', 'R2C5', 'R1C6'],
  ['R7C5', 'R8C5', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new Diagonal(-1),
  new Diagonal(1),
  ...doubleArrowPaths.map(path => new DoubleArrow(...path)),
];
