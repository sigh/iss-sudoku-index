// Title: Thermo Boost
// Author: Pete Craig
// Video: https://www.youtube.com/watch?v=oss31aLgxY8
// Source: https://tinyurl.com/2p92j78s

// Normal sudoku, 9x9, no givens. Each of the 8 thermometers must strictly
// increase from its bulb (the first-listed cell). Each of the 4 quadruple
// circles requires all four printed values to appear at least once among its
// surrounding 2x2 cells.

// Thermometers, bulb cell first (drawn geometry).
const thermos = [
  ['R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R1C2', 'R2C3', 'R3C4', 'R4C5'],
  ['R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R2C9', 'R3C8', 'R4C7', 'R5C6'],
  ['R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R9C8', 'R8C7', 'R7C6', 'R6C5'],
  ['R8C1', 'R7C2', 'R6C3', 'R5C4'],
  ['R8C4', 'R7C3', 'R6C2', 'R5C1'],
].map((cells) => new Thermo(...cells));

// Quadruple circles: topLeftCell of the 2x2 square, then the printed values.
const quads = [
  new Quad('R7C6', 3, 4, 5, 6),
  new Quad('R6C2', 2, 4, 6, 8),
  new Quad('R2C3', 2, 3, 7, 8),
  new Quad('R3C7', 3, 5, 6, 7),
];

return [
  new Shape('9x9'),
  ...thermos,
  ...quads,
];
