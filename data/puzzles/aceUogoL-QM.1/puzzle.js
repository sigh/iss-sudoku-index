// Title: June 2, 2022: Entropic Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=aceUogoL-QM
// Source: https://tinyurl.com/mtfycpcw

// Normal sudoku rules apply. Each drawn line (all 12 are exactly 3 cells
// long) must contain one low digit (1-3), one medium digit (4-6), and one
// high digit (7-9) -- exactly the semantics of the built-in Entropic class.
const givens = [
  ['R1C1', 2], ['R1C2', 3],
  ['R2C1', 1], ['R2C9', 6],
  ['R3C8', 4], ['R3C9', 5],
  ['R4C2', 9], ['R4C5', 3], ['R4C8', 8],
  ['R6C2', 6], ['R6C5', 8], ['R6C8', 2],
  ['R7C1', 6], ['R7C2', 5],
  ['R8C1', 4], ['R8C9', 7],
  ['R9C8', 9], ['R9C9', 8],
];

// Drawn lines, from the payload's `line` array.
const lines = [
  ['R3C2', 'R2C3', 'R1C4'],
  ['R3C4', 'R2C5', 'R1C6'],
  ['R3C6', 'R2C7', 'R1C8'],
  ['R9C2', 'R8C3', 'R7C4'],
  ['R9C4', 'R8C5', 'R7C6'],
  ['R9C6', 'R8C7', 'R7C8'],
  ['R4C1', 'R4C2', 'R4C3'],
  ['R6C1', 'R6C2', 'R6C3'],
  ['R4C4', 'R4C5', 'R4C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R6C7', 'R6C8', 'R6C9'],
  ['R4C7', 'R4C8', 'R4C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lines.map(cells => new Entropic(...cells)),
];
