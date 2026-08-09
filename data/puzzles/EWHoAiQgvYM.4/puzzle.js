// Title: Aug 12, 2022: Lockout Lines
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=EWHoAiQgvYM
// Source: https://tinyurl.com/3bymupyd

// Normal sudoku rules apply. Six lockout lines: on each, the two diamond
// endpoints must differ by at least 4, and every cell on the line strictly
// between the endpoints (by position) must not hold a value between the
// endpoint values. Encoded with the native Lockout constraint, one call per
// line, cells in line order so the first and last argument are the diamond
// endpoints. Endpoint cells and line memberships transcribed from the
// `lockout`/`line` arrays in the source payload.
const lockoutLines = [
  ['R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4'],
  ['R7C4', 'R7C5', 'R7C6'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'],
  ['R9C1', 'R9C2', 'R9C3'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C3', 6), new Given('R1C4', 9), new Given('R1C7', 7),
  new Given('R2C1', 3), new Given('R2C3', 9), new Given('R2C8', 2),
  new Given('R3C4', 8),
  new Given('R5C1', 6), new Given('R5C5', 5), new Given('R5C9', 8),
  new Given('R7C6', 9),
  new Given('R8C2', 4), new Given('R8C7', 2), new Given('R8C9', 3),
  new Given('R9C3', 7), new Given('R9C6', 6), new Given('R9C7', 4), new Given('R9C9', 9),
  ...lockoutLines.map(cells => new Lockout(4, ...cells)),
];
