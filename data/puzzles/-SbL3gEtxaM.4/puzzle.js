// Title: Between the Bars
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=-SbL3gEtxaM
// Source: https://tinyurl.com/4dkt496e

// Normal sudoku rules (default 9x9 with default 3x3 boxes).
// Each between line's interior digits must lie strictly between the two
// circled (undetermined) endpoint digits -> Between(...cells), passing the
// line's cells in path order so the first/last cells are the circles.
// The 16 given digits all fall on the interior cells of these lines; no
// circle endpoint is a given.

const givens = [
  ['R1C2', 2], ['R1C3', 8],
  ['R2C3', 4], ['R2C4', 8],
  ['R2C9', 2],
  ['R3C8', 8], ['R3C9', 5],
  ['R4C8', 7],
  ['R6C2', 8],
  ['R7C1', 2], ['R7C2', 7],
  ['R8C1', 3],
  ['R8C6', 5], ['R8C7', 7],
  ['R9C7', 6], ['R9C8', 2],
];

// Between lines: R#C# path from raw payload's `betweenline` entries, in
// drawn order (first/last cell = circle endpoint).
const betweenLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4'],
  ['R2C2', 'R2C3', 'R2C4', 'R2C5'],
  ['R3C3', 'R3C4', 'R3C5', 'R3C6'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C8'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R7C4', 'R7C5', 'R7C6', 'R7C7'],
  ['R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R4C3', 'R5C3', 'R6C3', 'R7C3'],
  ['R5C2', 'R6C2', 'R7C2', 'R8C2'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
