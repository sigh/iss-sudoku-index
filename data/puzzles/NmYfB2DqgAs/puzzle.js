// Title: Staples
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=NmYfB2DqgAs
// Source: https://sudokupad.app/dx1ord506o

// Normal sudoku rules apply (default row/column/box all-different from
// Shape). Each grey line is a bulb-less thermometer: along it, digits must
// strictly increase from the bulb to the tip, but the bulb is not marked --
// it is always at one end, and which end is for the solver to deduce.
// Each cell path below runs endpoint-to-endpoint with an arbitrary listed
// direction; encoded per line as Or(Thermo forward, Thermo reversed) so the
// solver -- not the encoding -- picks which end is the low (bulb) end.
// Cell paths transcribed from the drawn lines (each is a bent "staple": two
// straight legs joined by a diagonal crossbar through the middle cell).
const staples = [
  ['R1C4', 'R1C3', 'R2C2', 'R3C1', 'R4C1'],
  ['R4C3', 'R4C2', 'R5C2', 'R6C2', 'R6C3'],
  ['R6C1', 'R7C1', 'R8C2', 'R9C3', 'R9C4'],
  ['R7C4', 'R8C4', 'R8C5', 'R8C6', 'R7C6'],
  ['R9C6', 'R9C7', 'R8C8', 'R7C9', 'R6C9'],
  ['R4C7', 'R4C8', 'R5C8', 'R6C8', 'R6C7'],
  ['R4C9', 'R3C9', 'R2C8', 'R1C7', 'R1C6'],
  ['R3C4', 'R2C4', 'R2C5', 'R2C6', 'R3C6'],
];

const thermos = staples.map(
  cells => new Or([new Thermo(...cells), new Thermo(...[...cells].reverse())]));

// Givens transcribed from the drawn grid.
return [
  new Shape('9x9'),
  new Given('R4C1', 9),
  new Given('R4C9', 3),
  new Given('R6C1', 6),
  new Given('R6C9', 1),
  new Given('R8C3', 2),
  new Given('R8C7', 8),
  ...thermos,
];
