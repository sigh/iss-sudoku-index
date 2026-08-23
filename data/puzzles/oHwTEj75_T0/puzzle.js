// Title: 7ZAR
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=oHwTEj75_T0
// Source: https://app.crackingthecryptic.com/sudoku/q7FMdJ4QD9

// Normal sudoku (default 3x3 boxes) plus: digits do not repeat within a
// cage, and all cages sum to the same total, not printed anywhere and to be
// discovered by the solver. EqualSum enforces one common, unknown total
// across every cage's cell group regardless of size; AllDifferent enforces
// the no-repeat requirement per cage. The four background colours drawn on
// the cells are decoration (grouping non-adjacent cages for contrast plus a
// plain fill for uncaged cells) -- the rules never name a colour, so no
// colour-based constraint is encoded.

// Cage cell lists transcribed from the drawn cages.
const cages = [
  ['R1C3', 'R2C3'],
  ['R3C1', 'R4C1', 'R4C2', 'R5C2'],
  ['R5C1', 'R6C1'],
  ['R6C2', 'R6C3', 'R5C3'],
  ['R4C3', 'R4C4', 'R5C4', 'R6C4'],
  ['R1C5', 'R1C6'],
  ['R1C9', 'R2C9'],
  ['R2C5', 'R3C5', 'R3C4', 'R3C6'],
  ['R3C7', 'R3C8'],
  ['R4C5', 'R4C6'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R4C8', 'R4C9'],
  ['R5C9', 'R6C9', 'R7C9'],
  ['R9C9', 'R9C8', 'R9C7'],
  ['R7C7', 'R8C7'],
  ['R7C6', 'R7C5', 'R8C5', 'R9C5'],
  ['R7C4', 'R7C3'],
  ['R7C2', 'R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),
  new EqualSum(...cages),
  ...cages.map(cells => new AllDifferent(...cells)),
];
