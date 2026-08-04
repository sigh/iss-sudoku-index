// Title: Jan. 21, 2023: Consec. Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=HJ3aT7kBtSc
// Source: https://tinyurl.com/m4h9ttf

// Normal sudoku rules apply. White dots join two orthogonally adjacent cells
// whose digits are consecutive (WhiteDot). Not all possible dots are given,
// so an undotted adjacent pair carries no constraint either way.

// White dot pairs, transcribed from the payload's `difference` array.
const DOTS = [
  ['R4C3', 'R3C3'], ['R2C3', 'R3C3'], ['R3C3', 'R3C4'], ['R3C6', 'R3C7'],
  ['R3C8', 'R3C7'], ['R2C7', 'R3C7'], ['R4C7', 'R3C7'], ['R6C3', 'R7C3'],
  ['R7C2', 'R7C3'], ['R8C3', 'R7C3'], ['R7C4', 'R7C3'], ['R7C7', 'R7C8'],
  ['R7C7', 'R6C7'], ['R7C6', 'R7C7'], ['R8C7', 'R7C7'], ['R3C2', 'R3C3'],
  ['R8C4', 'R8C5'], ['R8C5', 'R8C6'], ['R5C8', 'R4C8'], ['R6C8', 'R5C8'],
  ['R4C2', 'R5C2'], ['R5C2', 'R6C2'], ['R2C4', 'R2C5'], ['R2C6', 'R2C5'],
  ['R6C1', 'R6C2'], ['R1C4', 'R2C4'], ['R5C6', 'R4C6'], ['R5C4', 'R6C4'],
];

return [
  new Shape('9x9'),

  new Given('R2C5', 4),
  new Given('R3C3', 2),
  new Given('R3C7', 7),
  new Given('R5C2', 8),
  new Given('R5C8', 2),
  new Given('R7C3', 6),
  new Given('R7C7', 3),
  new Given('R8C5', 5),

  ...DOTS.map(([a, b]) => new WhiteDot(a, b)),
];
