// Title: Border Square Sums
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=4fGVhKyx5HQ
// Source: https://sudokupad.app/2i3vnmx1ye

// Rules encoded here (nothing is omitted): normal Sudoku; every 2x2 square
// crossing a 3x3-box border sums to a multiple of 8 except the grey R5C6-R6C7
// square; and each arrow's arm digits sum to its circled digit.

const cell = (row, column) => makeCellId(row, column);

// These positions are derived from the box-border rule. A 2x2 can cross a box
// border only when its top row is 3 or 6, or its left column is 3 or 6. The
// grey drawn exception has top-left R5C6.
const borderSquares = [3, 6].flatMap(row =>
  Array.from({length: 8}, (_, index) => [row, index + 1]))
  .concat([3, 6].flatMap(column =>
    Array.from({length: 8}, (_, index) => [index + 1, column])))
  .filter(([row, column], index, squares) =>
    squares.findIndex(square => square[0] === row && square[1] === column) === index)
  .filter(([row, column]) => row !== 5 || column !== 6)
  .map(([row, column]) => [
    cell(row, column), cell(row, column + 1),
    cell(row + 1, column), cell(row + 1, column + 1),
  ]);

// In a standard Sudoku each such 2x2 contains four different digits, so its
// possible positive multiples of eight are 16 and 24.
const borderSquareSums = borderSquares.map(cells => new Or([
  new Sum(16, ...cells),
  new Sum(24, ...cells),
]));

// Arrow geometry transcribed from the two arrow entries: circle first, then arm.
const arrows = [
  new Arrow('R4C4', 'R4C3', 'R3C4'),
  new Arrow('R9C2', 'R9C1', 'R8C2'),
];

return [
  new Shape('9x9'),
  ...borderSquareSums,
  ...arrows,
];
