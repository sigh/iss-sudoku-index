// Title: Thermo Sudoku
// Author: Olima
// Video: https://www.youtube.com/watch?v=U99ZFz_X4TU
// Source: https://cracking-the-cryptic.web.app/sudoku/fJHjbmR2Jf

// Standard 9x9 sudoku (rows, columns, 3x3 boxes all-different, from Shape).
// No givens.
//
// Rules encoded:
// - Thermometers: digits increase strictly from the bulb to the end(s) of
//   each drawn line -> one Thermo per shaft, cells in bulb-first order.
//   Several shafts step diagonally between listed cells (grid-adjacency is
//   not required by Thermo, which binds only consecutive list order).
// - Two of the twelve drawn thermometers have one bulb feeding more than one
//   shaft (a single circle overlay sits at an interior cell of the drawn
//   stroke(s), and no other overlay marks either far end): each such bulb
//   gets one Thermo per arm, all sharing the bulb (and, for the three-arm
//   one, the next trunk cell) as their common start -- this is exactly what
//   the video description's "from the bulb to the end(s)" (plural) covers.
//   - R2C8 is one `lines` entry drawn tip-R3C9 -> bulb-R2C8 -> tip-R3C7 (the
//     overlay circle sits at R2C8, the path's interior cell); split there
//     into two arms.
//   - R5C4/R5C5 are two separate `lines` entries (R5C4-R5C5-R5C6 and
//     R4C5-R5C5-R6C5-R6C6) that cross only at R5C5, itself never an
//     endpoint of either; every other pair of thermometers in this puzzle is
//     cell-disjoint, and only R5C4 carries an overlay circle, so this is the
//     bulb for a third branching thermometer rather than two ordinary
//     thermometers that happen to overlap.

const thermos = [
  ['R1C3', 'R1C4', 'R2C4', 'R2C3', 'R3C3', 'R3C4'],
  ['R3C5', 'R3C6', 'R2C6', 'R2C5', 'R1C5', 'R1C6'],
  ['R3C2', 'R4C1'],
  ['R4C3', 'R4C2', 'R5C1', 'R6C2', 'R6C3'],
  ['R6C9', 'R6C8', 'R5C7', 'R4C8', 'R4C9'],
  ['R7C2', 'R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C1'],
  ['R8C3', 'R9C3', 'R9C4', 'R8C4'],
  ['R8C6', 'R9C6', 'R9C5', 'R8C5', 'R7C6'],
  ['R9C7', 'R9C8', 'R8C7', 'R8C8'],
  ['R6C4', 'R7C3'],
  // Branching bulb at R2C8 (two arms).
  ['R2C8', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R2C8', 'R1C7', 'R2C7', 'R3C7'],
  // Branching bulb at R5C4, shared trunk cell R5C5 (three arms).
  ['R5C4', 'R5C5', 'R5C6'],
  ['R5C4', 'R5C5', 'R4C5'],
  ['R5C4', 'R5C5', 'R6C5', 'R6C6'],
];

return [
  new Shape('9x9'),

  ...thermos.map((cells) => new Thermo(...cells)),
];
