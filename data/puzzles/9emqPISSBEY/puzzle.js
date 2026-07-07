// Even Distribution by charmquark
// https://sudokupad.app/wecos72fmn
// https://www.youtube.com/watch?v=9emqPISSBEY
//
// Normal sudoku. White dots are consecutive; black dots are 1:2 ratio.
// Killer cages sum to the given total with no repeated digits. Grey squares are even.

const cages = [
  [18, 'R6C3', 'R6C4', 'R7C3', 'R8C3'],
  [9, 'R5C7', 'R5C8', 'R5C9'],
  [20, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [20, 'R3C8', 'R3C9', 'R4C8', 'R4C9'],
  [20, 'R6C8', 'R6C9', 'R7C8', 'R7C9'],
  [23, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [18, 'R2C3', 'R3C3', 'R4C3', 'R4C4'],
  [15, 'R4C1', 'R5C1', 'R6C1'],
  [23, 'R7C4', 'R7C5', 'R7C6', 'R7C7'],
  [17, 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  [16, 'R4C2', 'R5C2', 'R6C2'],
];

const whiteDots = [
  ['R5C4', 'R5C5'],
  ['R5C5', 'R5C6'],
  ['R8C5', 'R8C6'],
  ['R2C2', 'R3C2'],
  ['R8C2', 'R8C3'],
  ['R2C8', 'R3C8'],
  ['R8C7', 'R8C8'],
  ['R2C5', 'R2C6'],
  ['R5C1', 'R5C2'],
];

const blackDots = [
  ['R4C5', 'R5C5'],
  ['R5C5', 'R6C5'],
  ['R2C4', 'R2C5'],
  ['R7C8', 'R8C8'],
  ['R2C7', 'R2C8'],
  ['R2C2', 'R2C3'],
  ['R7C2', 'R8C2'],
  ['R8C4', 'R8C5'],
  ['R5C7', 'R5C8'],
];

const evenCells = ['R4C6', 'R5C1', 'R4C9', 'R1C8', 'R7C2', 'R3C3', 'R7C9'];

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
