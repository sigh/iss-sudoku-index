// Title: Factoring in the Difference
// Author: Merdock
// Video: https://www.youtube.com/watch?v=9YcXmLzZvkQ
// Source: https://sudokupad.app/9sxe7q81rb

// The single-cell x cage makes x the digit in R5C5. Cage-size bounds leave
// only x=3 or x=4, so the nonlinear cage totals are encoded as two alternatives.
const algebraCages = (x) => new And([
  new Given('R5C5', x),
  new Cage(x + 3, 'R1C5', 'R2C5'),
  new Cage(5 * x, 'R1C6', 'R2C6', 'R3C6', 'R4C6'),
  new Cage(3 * x, 'R4C1', 'R4C2', 'R4C3'),
  new Cage(x * x - 3, 'R5C1', 'R5C2'),
  new Cage(2 * x - 1, 'R5C8', 'R5C9'),
  new Cage(x * x + 6, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(x + 5, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(x * x + x, 'R7C5', 'R8C5', 'R9C5'),
]);

const regionSumLines = [
  ['R1C1', 'R2C2', 'R3C3', 'R3C4', 'R2C4', 'R1C4', 'R1C3', 'R1C2', 'R2C3'],
  ['R9C9', 'R8C8', 'R7C7', 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R9C8', 'R8C7'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C3', 'R6C2', 'R6C1', 'R7C1', 'R8C1', 'R7C2'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9', 'R3C8'],
  ['R5C3', 'R6C4', 'R7C5'],
  ['R5C7', 'R6C6'],
  ['R3C5', 'R4C4'],
];

const whiteDots = [
  ['R1C8', 'R2C8'],
  ['R4C8', 'R5C8'],
  ['R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new Or([algebraCages(3), algebraCages(4)]),
];
