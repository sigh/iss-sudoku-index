// Title: Thermal Equilibrium
// Author: Flinty
// Video: https://www.youtube.com/watch?v=k-djoW_GVmI
// Source: https://sudokupad.app/z1xpy7lrl5

// Rules:
//   1. Normal Sudoku.
//   2. Digits may not repeat along the indicated diagonals. Two diagonals are
//      drawn, corner to corner in both directions, so both are encoded.
//   3. Thermometers: digits strictly increase from the bulb to the tip.
//   4. Every thermometer has the same total; the total is not given.
// No givens, and no clause is omitted.

// Drawn thermometer strokes, bulb first: the interpolated cell path of each
// grey line, whose first waypoint carries a grey bulb circle. The last
// thermometer leaves the border with a corner-to-corner diagonal step from
// R1C4 to R2C3.
const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R5C1', 'R6C1', 'R7C1'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R9C4', 'R9C5', 'R9C6'],
  ['R9C7', 'R9C8', 'R9C9', 'R8C9'],
  ['R7C9', 'R6C9', 'R5C9', 'R4C9'],
  ['R3C9', 'R2C9', 'R1C9', 'R1C8'],
  ['R1C7', 'R1C6', 'R1C5'],
  ['R1C2', 'R1C3', 'R1C4', 'R2C3'],
];

return [
  new Shape('9x9'),
  // 1 selects the anti-diagonal R1C9..R9C1; -1 the main diagonal R1C1..R9C9.
  new Diagonal(1),
  new Diagonal(-1),
  ...thermos.map(cells => new Thermo(...cells)),
  new EqualSum(...thermos),
];
