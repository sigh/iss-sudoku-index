// Title: Entropic Lines Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=rV-Z57M3y9I
// Source: https://tinyurl.com/2txcbptk

// Normal sudoku rules (default rows/cols/boxes). Along each line, every
// sequential run of 3 cells must contain one low digit (1-3), one middle
// digit (4-6) and one high digit (7-9) -- exactly what the native
// `Entropic` class enforces over a cell list, sliding one cell at a time.

// Given digits, transcribed from the payload's `grid` array.
const givens = [
  ['R1C1', 4], ['R1C2', 5], ['R1C3', 9], ['R1C7', 3], ['R1C8', 8], ['R1C9', 1],
  ['R2C1', 2], ['R2C9', 5],
  ['R3C1', 3], ['R3C9', 9],
  ['R4C5', 1],
  ['R5C4', 2], ['R5C6', 4],
  ['R6C5', 3],
  ['R7C1', 6], ['R7C9', 2],
  ['R8C1', 7], ['R8C9', 8],
  ['R9C1', 8], ['R9C2', 2], ['R9C3', 5], ['R9C7', 7], ['R9C8', 1], ['R9C9', 4],
];

// Four entropic lines, transcribed from the payload's `line` array (each
// its own separate line, single gold colour).
const lines = [
  ['R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C7', 'R4C7', 'R5C6'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8', 'R7C7', 'R7C6', 'R6C5'],
  ['R8C7', 'R9C6', 'R9C5', 'R9C4', 'R8C3', 'R7C3', 'R6C3', 'R5C4'],
  ['R7C2', 'R6C1', 'R5C1', 'R4C1', 'R3C2', 'R3C3', 'R3C4', 'R4C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lines.map((cells) => new Entropic(...cells)),
];
