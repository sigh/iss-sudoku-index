// Title: Unique Sums Sudoku
// Author: Jakub Hrazdira
// Video: https://www.youtube.com/watch?v=lt5vDPFrOEE
// Source: https://cracking-the-cryptic.web.app/sudoku/RMrtrJm7qp
//
// Normal sudoku rules apply (default row/column/box all-different; the
// grid's own regions are exactly the nine default 3x3 boxes). 21 cages,
// each forbidding a repeated digit among its own cells; no cage prints a
// total (Cage(0, ...) is ISS's "no total" form: AllDifferent only). No
// rules text names any further relationship between the cages, so none
// is encoded.

const cages = [
  ['R1C1'],
  ['R2C2'],
  ['R3C3'],
  ['R4C4'],
  ['R5C5'],
  ['R6C6', 'R7C7', 'R8C8', 'R9C9'],
  ['R1C3', 'R1C4'],
  ['R2C3', 'R2C4'],
  ['R1C5', 'R1C6', 'R1C7'],
  ['R2C7', 'R3C7', 'R4C7'],
  ['R2C8', 'R3C8', 'R4C8'],
  ['R5C9', 'R6C9'],
  ['R7C9', 'R8C9'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R8C5', 'R9C5'],
  ['R7C5', 'R7C4'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R7C2', 'R6C2'],
  ['R8C1', 'R7C1', 'R6C1'],
  ['R4C1', 'R3C1', 'R2C1'],
  ['R5C2', 'R5C3'],
];

return [
  new Shape('9x9'),

  new Given('R1C9', 4),
  new Given('R4C5', 1),
  new Given('R5C4', 8),
  new Given('R5C5', 9),
  new Given('R5C6', 4),
  new Given('R6C5', 6),
  new Given('R9C1', 1),

  ...cages.map((cells) => new Cage(0, ...cells)),
];
