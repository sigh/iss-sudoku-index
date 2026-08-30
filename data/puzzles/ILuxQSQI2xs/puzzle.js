// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ILuxQSQI2xs
// Source: https://cracking-the-cryptic.web.app/sudoku/d7pjJtfGf2

// Normal sudoku (standard rows, columns and 3x3 boxes). Clone: the two grey
// shapes are identical, i.e. each cell of shape 1 holds the same digit as its
// corresponding cell of shape 2. Nothing else is drawn or stated.
const givens = {
  R1C1: 2, R1C8: 8,
  R2C7: 7, R2C9: 2,
  R3C6: 6, R3C8: 1,
  R4C5: 5, R4C7: 9,
  R5C4: 4, R5C6: 8,
  R6C3: 3, R6C5: 7,
  R7C2: 2, R7C4: 6,
  R8C1: 1, R8C3: 5,
  R9C2: 4, R9C9: 1,
};

// Shape 1 (upper-left grey diagonal, row+col=7) and shape 2 (lower-right grey
// diagonal, row+col=13), from the two underlay clusters. Shape 2 is shape 1
// translated by (+3 rows, +3 cols) -- the only rigid translation matching
// both shapes cell-for-cell -- so that translation fixes the correspondence
// the clone rule ("the two grey shapes are identical") pairs cell-by-cell.
const shape1 = ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'];
const shape2 = ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'];

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
  ...shape1.map((cell, i) => new SameValues(2, cell, shape2[i])),
];
