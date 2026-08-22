// Title: Dec 27, 2021: Lockout Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=RToyNMs8sFQ
// Source: https://tinyurl.com/2p8jmd4x

// Normal sudoku rules apply. Seven lockout lines: on each, the two diamond
// endpoints must differ by at least 4, and every cell on the line strictly
// between the endpoints (by position) must not hold a value between the
// endpoint values. Encoded with the native Lockout constraint, one call per
// line, cells in line order so the first and last argument are the diamond
// endpoints. Endpoint cells and line memberships transcribed from the
// `rectangle`/`line` arrays in the source payload; three diamonds (R3C3,
// R1C1, R5C5) are each the shared endpoint of two lines.
const lockoutLines = [
  ['R7C3', 'R6C3', 'R5C3', 'R4C3', 'R3C3'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'],
  ['R5C9', 'R5C8', 'R5C7', 'R5C6', 'R5C5'],
  ['R9C7', 'R8C7', 'R7C7', 'R7C8', 'R7C9'],
];

return [
  new Shape('9x9'),
  new Given('R1C5', 9),
  new Given('R2C2', 7), new Given('R2C3', 4),
  new Given('R3C2', 3), new Given('R3C3', 6),
  new Given('R4C7', 4),
  new Given('R5C1', 1), new Given('R5C5', 4), new Given('R5C6', 3),
  new Given('R6C5', 2), new Given('R6C6', 8),
  new Given('R7C4', 2),
  new Given('R8C8', 4), new Given('R8C9', 5),
  new Given('R9C8', 3), new Given('R9C9', 2),
  ...lockoutLines.map(cells => new Lockout(4, ...cells)),
];
