// Title: Mar 17, 2022: Lockout Lines
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=-pInDSLVfCo
// Source: https://tinyurl.com/mr24hz3n

// Normal sudoku rules apply. Five lockout lines: on each, the two diamond
// endpoints must differ by at least 4, and every cell on the line strictly
// between the endpoints (by position) must not hold a value between the
// endpoint values. Encoded with the native Lockout constraint, one call per
// line, cells in line order so the first and last argument are the diamond
// endpoints. Endpoint cells and line memberships transcribed from the
// `lockout`/`line` arrays in the source payload.
const lockoutLines = [
  ['R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7'],
  ['R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9'],
  ['R4C1', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R4C3', 'R4C4', 'R5C5', 'R6C6', 'R6C7'],
];

return [
  new Shape('9x9'),
  new Given('R1C3', 3), new Given('R1C4', 2), new Given('R1C6', 9), new Given('R1C7', 8),
  new Given('R3C7', 5),
  new Given('R4C1', 5), new Given('R4C5', 2), new Given('R4C8', 3),
  new Given('R5C2', 1), new Given('R5C8', 9),
  new Given('R6C2', 3), new Given('R6C5', 4), new Given('R6C9', 5),
  new Given('R7C3', 5),
  new Given('R9C3', 4), new Given('R9C4', 3), new Given('R9C6', 7), new Given('R9C7', 6),
  ...lockoutLines.map(cells => new Lockout(4, ...cells)),
];
