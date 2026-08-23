// Title: Trickling Down
// Author: Mr. Menace
// Video: https://www.youtube.com/watch?v=RUCIA8Ot9T0
// Source: https://app.crackingthecryptic.com/sudoku/rGF3gpgnmM

// Normal sudoku rules apply. Six lockout lines: on each, the two
// yellow-highlighted endpoint cells must differ by at least 4, and every
// other cell on the line must hold a value strictly outside the endpoints'
// range. Encoded with the native Lockout constraint, one call per line,
// cells in line order so the first and last argument are the yellow
// endpoints. Endpoints and line cells transcribed from the yellow
// `underlays` and the `lines` waypoint geometry in the source payload; R2C5
// is the shared endpoint of the first two lines.
const lockoutLines = [
  ['R2C1', 'R1C2', 'R1C3', 'R1C4', 'R2C5'],
  ['R2C5', 'R1C6', 'R1C7', 'R1C8', 'R2C9'],
  ['R6C1', 'R5C2', 'R5C3', 'R5C4', 'R4C5'],
  ['R6C5', 'R5C6', 'R5C7', 'R5C8', 'R4C9'],
  ['R9C1', 'R8C2', 'R7C3', 'R7C4'],
  ['R8C5', 'R8C6', 'R8C7', 'R8C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new Given('R2C2', 2),
  new Given('R4C3', 2), new Given('R4C7', 1),
  new Given('R6C3', 4), new Given('R6C7', 8),
  new Given('R9C4', 3), new Given('R9C6', 2),
  ...lockoutLines.map(cells => new Lockout(4, ...cells)),
];
