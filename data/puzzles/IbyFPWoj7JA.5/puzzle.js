// Title: September 25, 2022: Carpe XVem
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=IbyFPWoj7JA
// Source: https://tinyurl.com/3fju9yry

// Normal sudoku rules apply. Adjacent cells joined by an X sum to 10; joined
// by a V sum to 5. The rules text states there is no negative constraint, so
// unmarked adjacent pairs are left free to also sum to 5 or 10 (StrictXV is
// intentionally not used).

// Givens, from the payload's given cells.
const givens = [
  new Given('R3C3', 8),
  new Given('R3C7', 6),
  new Given('R4C4', 2),
  new Given('R5C3', 4),
  new Given('R5C5', 1),
  new Given('R5C7', 9),
  new Given('R6C6', 3),
  new Given('R7C3', 5),
  new Given('R7C7', 7),
];

// X pairs (sum to 10), from the payload's xv structures with value "X".
const xPairs = [
  ['R1C5', 'R1C6'],
  ['R1C7', 'R1C8'],
  ['R2C9', 'R3C9'],
  ['R4C9', 'R5C9'],
  ['R7C1', 'R8C1'],
  ['R5C1', 'R6C1'],
  ['R9C2', 'R9C3'],
  ['R9C4', 'R9C5'],
  ['R2C3', 'R2C4'],
  ['R3C2', 'R4C2'],
  ['R6C8', 'R7C8'],
  ['R8C6', 'R8C7'],
  ['R8C2', 'R8C3'],
  ['R2C8', 'R3C8'],
];

// V pairs (sum to 5), from the payload's xv structures with value "V".
const vPairs = [
  ['R9C6', 'R9C7'],
  ['R1C3', 'R1C4'],
  ['R6C9', 'R7C9'],
  ['R3C1', 'R4C1'],
  ['R7C2', 'R8C2'],
  ['R2C7', 'R2C8'],
  ['R1C6', 'R1C7'],
  ['R9C3', 'R9C4'],
  ['R2C2', 'R2C3'],
  ['R8C7', 'R8C8'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...xPairs.map(cells => new X(...cells)),
  ...vPairs.map(cells => new V(...cells)),
];
