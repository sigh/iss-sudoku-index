// Title: In Between Days
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=y6tGf209-FU
// Source: https://tinyurl.com/ycy86hd3

// Normal sudoku rules (default 9x9 with default 3x3 boxes).
// Each between line's interior digits must lie strictly between the two
// circled (undetermined) endpoint digits -> Between(...cells), passing the
// line's cells in path order so the first/last cells are the circles.

const givens = [
  ['R1C1', 9], ['R1C2', 4],
  ['R3C1', 7], ['R3C3', 8],
  ['R4C1', 3], ['R4C4', 7], ['R4C6', 6], ['R4C9', 4],
  ['R5C1', 5], ['R5C9', 6],
  ['R6C1', 6], ['R6C4', 4], ['R6C6', 3], ['R6C9', 7],
  ['R7C7', 2], ['R7C9', 3],
  ['R9C8', 6], ['R9C9', 1],
];

// Between lines: R#C# path from raw payload's `betweenline` entries, in
// drawn order (first/last cell = circle endpoint).
const betweenLines = [
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R8C6'],
  ['R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4'],
  ['R7C2', 'R8C2', 'R8C3', 'R8C4', 'R8C5', 'R7C5'],
  ['R3C5', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R3C8'],
  ['R6C3', 'R7C3', 'R7C4', 'R6C4'],
  ['R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R1C2', 'R2C2', 'R2C3', 'R3C3'],
  ['R7C7', 'R8C7', 'R8C8', 'R9C8'],
  ['R4C7', 'R3C7', 'R3C6', 'R4C6'],
];

return [
  new Shape('9x9'),

  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...betweenLines.map(cells => new Between(...cells)),
];
