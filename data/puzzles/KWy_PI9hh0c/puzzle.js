// Title: Arrows And A Big X
// Author: GBPack
// Video: https://www.youtube.com/watch?v=KWy_PI9hh0c
// Source: https://app.crackingthecryptic.com/sudoku/Jm68ttrm8q

// Standard Sudoku (rows, columns, boxes all-different) plus two variant rules:
// each main diagonal cannot repeat a digit, and digits along each arrow sum
// to the digit in that arrow's bulb circle. No givens are printed.

// Diagonal cell paths, transcribed from the drawn geometry (both diagonals
// run corner-to-corner across the full grid), given here only for the
// provenance comment on Diagonal's direction argument below.
// Diagonal(-1) is the '\' diagonal R1C1..R9C9; Diagonal(1) is the '/'
// diagonal R1C9..R9C1 (ISS's own convention, confirmed via ARGUMENT_CONFIG).

// Arrows: bulb cell first, then arm cells, per the drawn arrow paths. Bulb
// cells match the six white/grey-bordered circle underlays.
const arrows = [
  ['R3C4', 'R2C3', 'R1C3', 'R1C2'],
  ['R3C6', 'R2C7', 'R1C7', 'R1C8'],
  ['R7C4', 'R8C3', 'R9C3', 'R9C2'],
  ['R7C6', 'R8C7', 'R8C8', 'R9C8'],
  ['R7C2', 'R6C3', 'R5C2'],
  ['R4C7', 'R5C8', 'R6C9'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...arrows.map(cells => new Arrow(...cells)),
];
