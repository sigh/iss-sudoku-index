// Title: Partial Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Hu4jr-Bobyg
// Source: https://cracking-the-cryptic.web.app/sudoku/MdgMPTfFJF

// Normal Sudoku rules apply (default row/column/box all-different from Shape).
// Eight 9-cell cages are drawn; none prints a total ("Partial Killer" -- no
// sums given). A totalless cage is still read as an all-different set, so
// each becomes an AllDifferent over its nine cells. Six cells belong to no
// cage and get no extra constraint beyond the row/column/box defaults.

// Cage cell lists transcribed from the drawn cages (payload `cages[]`); each
// cage is a full 9-cell all-different set.
const cages = [
  ['R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R3C2'],
  ['R3C3', 'R2C3', 'R2C4', 'R2C5', 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'],
  ['R1C7', 'R2C7', 'R2C8', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R4C8', 'R5C8', 'R6C8', 'R6C9', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R5C4'],
  ['R5C6', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1', 'R5C2', 'R6C2'],
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R8C3', 'R9C3', 'R9C2', 'R9C1'],
  ['R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R8C5', 'R8C6', 'R8C7', 'R7C7'],
  ['R7C8', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4'],
];

return [
  new Shape('9x9'),
  new Given('R1C8', 7),
  new Given('R2C1', 5),
  new Given('R2C5', 8),
  new Given('R3C4', 9),
  new Given('R5C8', 3),
  new Given('R6C2', 6),
  new Given('R6C7', 8),
  new Given('R7C2', 2),
  new Given('R7C6', 5),
  new Given('R8C9', 1),
  new Given('R9C2', 7),
  new Given('R9C3', 4),
  ...cages.map(c => new AllDifferent(...c)),
];
