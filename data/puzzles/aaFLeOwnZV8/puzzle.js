// Title: Two's Company, Three's a Crowd
// Author: SUDOOOOOKUfan87
// Video: https://www.youtube.com/watch?v=aaFLeOwnZV8
// Source: https://sudokupad.app/3w2n46bl22

// Normal Sudoku rules apply. Each arrow's first cell is its circled bulb and
// equals the sum of the remaining cells. Each renban contains a non-repeating
// set of consecutive digits in any order.

const arrowPaths = [
  ['R1C2', 'R2C3', 'R2C4'],
  ['R9C2', 'R8C3', 'R8C4'],
  ['R9C8', 'R8C7', 'R8C6'],
  ['R1C8', 'R2C7', 'R2C6'],
  ['R4C2', 'R5C3', 'R5C4'],
  ['R4C8', 'R5C7', 'R5C6'],
  ['R5C1', 'R6C2', 'R7C2'],
  ['R5C9', 'R6C8', 'R7C8'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R3C8', 'R3C7', 'R3C6'],
];

const renbanPaths = [
  ['R4C1', 'R5C2', 'R6C3'],
  ['R7C7', 'R6C7', 'R5C8'],
  ['R6C5', 'R7C4', 'R7C5', 'R7C6'],
];

const arrows = arrowPaths.map(cells => new Arrow(...cells));
const renbans = renbanPaths.map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
];
