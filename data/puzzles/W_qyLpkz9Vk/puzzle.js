// Title: Symmetry?
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=W_qyLpkz9Vk
// Source: https://app.crackingthecryptic.com/sudoku/QnQHF7mpHG

// Normal sudoku rules apply. One given: R1C9 = 2.
//
// Quadruple: the white circle at the corner of R6C3/R6C4/R7C3/R7C4 requires
// digits 1, 2, 4, 8 to each appear among those four cells.
//
// Cages: digits in a cage cannot repeat and must sum to the clue in the
// upper-left cell. One 9-cell cage (R3C5-R3C7/R4C5-R4C7/R5C5-R5C7, a 3x3
// block offset from the boxes) sums to 45; one 3-cell cage
// (R8C1,R9C1,R9C2) sums to 23.
//
// Green clone: "identical digits in identical positions" -- the 2x2 block
// R5C1/R5C2/R6C1/R6C2 and the 2x2 block R8C4/R8C5/R9C4/R9C5 are related by a
// fixed row+3/col+3 translation, so each is encoded as a positional pair
// rather than a same-multiset relation.
//
// Purple clone: R1C1 and R9C9 must hold the same digit (no positional
// structure named beyond the two cells).
//
// Thermometer, bulb at R2C5: strictly increasing along
// R2C5-R2C6-R2C7-R3C8-R4C8-R5C8.
//
// Black dots (Kropki, one value double the other): R4C5/R4C6 and
// R4C6/R5C6. The rules state not all possible dots are given, so no negative
// (StrictKropki) constraint applies to unmarked pairs.
//
// Parity: grey circles hold odd digits; grey squares hold even digits --
// encoded as multi-value Givens. Only R9C1 is encoded as a grey-circle
// clue. The payload also underlays a grey circle at R2C5, but at 0.7x0.7 it
// is smaller than R9C1's and the three grey squares' shared 0.8x0.8 size,
// and it sits exactly on the thermometer's bulb cell in the thermo's own
// grey colour -- the bulb-cap rendering, not a second parity clue. Grey
// squares (R5C5, R3C7, R2C8) hold even digits.

const greenPairs = [
  ['R5C1', 'R8C4'],
  ['R5C2', 'R8C5'],
  ['R6C1', 'R9C4'],
  ['R6C2', 'R9C5'],
];

return [
  new Shape('9x9'),
  new Given('R1C9', 2),

  new Quad('R6C3', 1, 2, 4, 8),

  new Cage(45, 'R3C5', 'R3C6', 'R3C7', 'R4C5', 'R4C6', 'R4C7', 'R5C5', 'R5C6', 'R5C7'),
  new Cage(23, 'R8C1', 'R9C1', 'R9C2'),

  ...greenPairs.map(([a, b]) => new SameValues(2, a, b)),
  new SameValues(2, 'R1C1', 'R9C9'),

  new Thermo('R2C5', 'R2C6', 'R2C7', 'R3C8', 'R4C8', 'R5C8'),

  new BlackDot('R4C5', 'R4C6'),
  new BlackDot('R4C6', 'R5C6'),

  new Given('R9C1', 1, 3, 5, 7, 9),
  new Given('R5C5', 2, 4, 6, 8),
  new Given('R3C7', 2, 4, 6, 8),
  new Given('R2C8', 2, 4, 6, 8),
];
