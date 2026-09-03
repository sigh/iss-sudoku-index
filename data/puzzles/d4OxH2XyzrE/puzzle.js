// Title: Broken Arrows
// Author: RobK
// Video: https://www.youtube.com/watch?v=d4OxH2XyzrE
// Source: https://app.crackingthecryptic.com/sudoku/PDfjrfN9pF

// Normal sudoku, no givens. Digits on an arrow sum to the number in the
// connected circle. Nine of the sixteen arrows are drawn with no circle at
// their tail and nine of the sixteen circles are drawn with no arrow: for every
// digit, the number of those loose circles holding it equals the number of
// broken arrows summing to it. Nothing is omitted.
//
// Each broken arrow still has a circle, so all sixteen arrow sums are digits
// 1-9; the two counts therefore total nine each, and the rule is exactly the
// statement that the nine broken-arrow sums and the nine loose-circle digits are
// the same multiset. (Read over all sixteen arrows instead, the counts would
// total sixteen against nine and could never balance.)

// Arrows whose stroke starts inside a drawn circle: [circle, ...arrow cells].
const ATTACHED = [
  ['R2C2', 'R3C3', 'R3C4'],
  ['R4C3', 'R3C3', 'R3C4'],
  ['R2C8', 'R3C7', 'R2C6'],
  ['R5C5', 'R4C5', 'R3C5'],
  ['R6C4', 'R5C3', 'R4C4'],
  ['R8C3', 'R7C3', 'R6C3'],
  ['R7C9', 'R6C9', 'R5C8'],
];

// Arrows drawn with no circle at the tail, cells in drawn order.
const BROKEN = [
  ['R2C3', 'R1C4'],
  ['R4C1', 'R3C2'],
  ['R2C7', 'R1C6'],
  ['R4C9', 'R3C8'],
  ['R9C2', 'R8C2'],
  ['R9C1', 'R8C1', 'R7C2'],
  ['R7C7', 'R6C7', 'R5C7'],
  ['R9C9', 'R8C9', 'R7C8'],
  ['R9C8', 'R8C8'],
];

// Circles drawn with no arrow touching them.
const LOOSE_CIRCLES = [
  'R6C5',
  'R7C4', 'R7C5', 'R7C6',
  'R8C4', 'R8C6',
  'R9C4', 'R9C5', 'R9C6',
];

// One Var per broken arrow, standing for the circle it lost. It takes the
// grid's 1-9 range, which is the range a circle digit has.
const lostCircles = new Var('B', 'circles of the broken arrows', BROKEN.length);
const lostCircleCells = lostCircles.cells();

return [
  new Shape('9x9'),
  ...ATTACHED.map(cells => new Arrow(...cells)),
  lostCircles,
  ...BROKEN.map((cells, i) => new Arrow(lostCircleCells[i], ...cells)),
  // Two sets of nine holding the same values with the same multiplicities is
  // the per-digit count equality.
  new SameValues(2, ...lostCircleCells, ...LOOSE_CIRCLES),
];
