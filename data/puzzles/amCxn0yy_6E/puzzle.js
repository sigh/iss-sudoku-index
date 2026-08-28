// Title: Unknown
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=amCxn0yy_6E
// Source: https://cracking-the-cryptic.web.app/sudoku/NTRf7nPdfp

// Normal sudoku rules apply (default Shape('9x9'): rows, columns, and the
// standard nine 3x3 boxes all-different). In addition, each of the eight
// L-shaped grey pentomino cages must contain five consecutive digits, in
// any order -- Renban's exact semantics ("Digits on the line must be
// consecutive and non-repeating, in any order"), applied here to a cage's
// cell set rather than a line; Renban is set-based so cell order does not
// matter. Cage cell lists are transcribed from the `cages` array (each
// entry's cell list, matching the grey `underlays` fill); none carries a
// printed total.
const givens = [
  ['R1C2', 2], ['R1C3', 3], ['R1C7', 9], ['R2C1', 1],
  ['R4C6', 1], ['R5C6', 8], ['R7C7', 8], ['R9C7', 7],
];

const lCages = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1'],
  ['R2C4', 'R2C5', 'R2C6', 'R2C7', 'R3C4'],
  ['R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R4C7', 'R4C8', 'R5C8', 'R6C8', 'R7C8'],
  ['R8C9', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R7C6', 'R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2'],
  ['R3C2', 'R4C2', 'R5C2', 'R6C2', 'R6C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lCages.map((cells) => new Renban(...cells)),
];
