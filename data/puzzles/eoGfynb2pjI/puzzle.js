// Title: My new rope belt
// Author: JohnGisMe
// Video: https://www.youtube.com/watch?v=eoGfynb2pjI
// Source: https://sudokupad.app/uhibpjqrwh

// Normal Sudoku rules apply. Cages have no totals and are all-different;
// thermometers increase from their bulbs; unmarked Kropki holes are allowed.
const noRepeatCages = [
  ['R8C4', 'R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C8', 'R4C9', 'R5C8', 'R5C9', 'R6C8', 'R6C9'],
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C1', 'R2C2', 'R2C3'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R7C2', 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
];

const whiteDots = [
  ['R8C3', 'R8C4'],
  ['R7C8', 'R6C8'],
  ['R1C3', 'R1C2'],
];

const blackDots = [
  ['R7C3', 'R6C3'],
  ['R3C1', 'R3C2'],
  ['R3C8', 'R4C8'],
  ['R1C4', 'R1C5'],
  ['R7C6', 'R7C5'],
  ['R4C7', 'R5C7'],
];

return [
  new Shape('9x9'),
  new Given('R9C1', 9),
  ...noRepeatCages.map(cells => new AllDifferent(...cells)),
  new Thermo('R5C4', 'R4C5', 'R4C6', 'R5C5', 'R4C4'),
  new Thermo('R8C2', 'R9C3', 'R8C3', 'R7C2', 'R7C1', 'R8C1', 'R9C2'),
  new Thermo('R8C2', 'R9C3', 'R8C3', 'R7C2', 'R7C1', 'R6C1'),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
];
