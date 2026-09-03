// Title: Multiples of 7
// Author: Unknown
// Video: https://www.youtube.com/watch?v=-ss5o7lilfQ
// Source: https://cracking-the-cryptic.web.app/sudoku/NbNQjn8mfh

// Rules encoded:
// - Normal sudoku rules: rows, columns and the nine standard 3x3 boxes each
//   hold 1-9 once. This is the default grid.
// - Five givens.
// - Each of the 28 white edge markers joins two orthogonally adjacent cells
//   whose digits, read as a two-digit number, are a multiple of 7. The number
//   is read left to right along a row and top to bottom down a column, the
//   ordinary typographic order for a number written across cells; the markers
//   are drawn identically and carry no directional decoration that would
//   select a different order.
// Not encoded:
// - Whether the marking is exhaustive ("every adjacent pair forming a
//   multiple of 7 is marked"), which would additionally forbid the relation on
//   every unmarked adjacent pair. The source states no rules at all, so no
//   sentence licenses that negative and it is left out.

// The two-digit number formed by the pair, in list order, is divisible by 7:
// a is the upper or left cell, b the lower or right one. Values are 1-9, so
// 10*a + b never contains a zero digit; the multiples this admits are
// 14, 21, 28, 35, 42, 49, 56, 63, 84, 91 and 98, plus 77, which normal sudoku
// already forbids between two adjacent cells.
const multipleOf7 = Pair.fnToKey((a, b) => (10 * a + b) % 7 === 0, 9);

// One entry per drawn white edge marker, upper or left cell first.
const markers = [
  ['R1C7', 'R2C7'], ['R1C8', 'R1C9'], ['R1C9', 'R2C9'], ['R2C4', 'R2C5'],
  ['R2C4', 'R3C4'], ['R2C6', 'R2C7'], ['R2C8', 'R3C8'], ['R3C3', 'R3C4'],
  ['R3C6', 'R4C6'], ['R4C4', 'R4C5'], ['R4C5', 'R4C6'], ['R4C6', 'R5C6'],
  ['R5C3', 'R6C3'], ['R5C5', 'R6C5'], ['R5C6', 'R5C7'], ['R5C9', 'R6C9'],
  ['R6C3', 'R7C3'], ['R6C5', 'R6C6'], ['R6C6', 'R6C7'], ['R7C2', 'R7C3'],
  ['R7C3', 'R8C3'], ['R7C5', 'R7C6'], ['R8C3', 'R8C4'], ['R8C4', 'R8C5'],
  ['R8C5', 'R9C5'], ['R8C6', 'R8C7'], ['R9C7', 'R9C8'], ['R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),

  new Given('R2C8', 6),
  new Given('R3C7', 5),
  new Given('R5C5', 3),
  new Given('R7C3', 2),
  new Given('R8C2', 1),

  ...markers.map(([a, b]) => new Pair(multipleOf7, 'multiple-of-7', a, b)),
];
