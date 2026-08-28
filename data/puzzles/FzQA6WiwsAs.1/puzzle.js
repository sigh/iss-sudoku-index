// Title: Unrolling U's
// Author: Stephen Parthimos
// Video: https://www.youtube.com/watch?v=FzQA6WiwsAs
// Source: https://cracking-the-cryptic.web.app/sudoku/fFB8RMtngr

// Normal sudoku (default 9x9 rows/cols/boxes). Digits increase along
// thermometers from the bulb; the grey column-5 line has its bulb at the
// centre (R5C5), so it is two thermometers sharing that bulb cell, one
// running up to R1C5 and one down to R9C5.
//
// Six yellow-green lines each trace a "U": a straight run of three central
// cells with a two-cell arm bent away at each end (one-cell arms for the
// two short U's near the top/bottom edge). The rule says unrolling a U
// straight -- keeping its three central cells fixed and continuing the line
// through them instead of bending the arms out -- reproduces the same
// digits. Working out where each arm cell lands under that straight
// continuation, and chasing the resulting pairs (an unroll target for one
// U can be the bent-arm cell of another), merges into eight closed groups
// of three cells that must all share a digit. Encoded as SameValues(3, ...)
// per group -- three size-1 sets forced equal.
const sameValueGroups = [
  ['R1C4', 'R2C3', 'R4C1'],
  ['R1C6', 'R2C7', 'R4C9'],
  ['R6C1', 'R8C3', 'R9C4'],
  ['R6C9', 'R8C7', 'R9C6'],
  ['R2C4', 'R3C3', 'R4C2'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R2C6', 'R3C7', 'R4C8'],
  ['R6C8', 'R7C7', 'R8C6'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C8', 3),
  new Given('R4C4', 4),
  new Given('R4C7', 3),
  new Given('R5C3', 2),
  new Given('R5C4', 3),
  new Given('R5C6', 6),
  new Given('R5C7', 9),
  new Given('R6C3', 3),
  new Given('R6C6', 7),
  new Given('R8C2', 8),
  new Given('R9C9', 1),

  new Thermo('R5C5', 'R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Thermo('R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),

  ...sameValueGroups.map(cells => new SameValues(3, ...cells)),
];
