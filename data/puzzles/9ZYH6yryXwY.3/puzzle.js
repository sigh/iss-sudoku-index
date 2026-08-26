// Title: Dec. 1, 2022: Consec. Clones
// Author: clover!
// Video: https://www.youtube.com/watch?v=9ZYH6yryXwY
// Source: https://tinyurl.com/ydc7a27t

// Normal sudoku rules apply. Digits in the same relative position in the two
// matching 13-cell shapes must be consecutive to each other.
//
// Two congruent shapes are drawn on the grid as no-total cages (a "clone"
// pair); shape B is shape A translated 4 rows down and 4 columns right, so
// each shape-A cell has exactly one corresponding shape-B cell at the same
// offset within the shape. The consecutive rule is encoded as one `Pair`
// per corresponding cell pair (13 pairs), each requiring the two digits to
// differ by exactly 1. No-total cages carry no sum constraint themselves.

const shapeA = [
  'R1C3', 'R2C2', 'R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5',
  'R4C2', 'R4C3', 'R4C4', 'R5C3',
];
const shapeB = [
  'R5C7', 'R6C6', 'R6C7', 'R6C8', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9',
  'R8C6', 'R8C7', 'R8C8', 'R9C7',
];

// shapeB[i] = shapeA[i] translated +4 rows, +4 cols (checked against the
// drawn cage cell lists), so index i in each array is the corresponding
// pair of cells.
const consecutiveKey = Pair.fnToKey(
  (a, b) => Math.abs(a - b) === 1, 9);

const clonePairs = shapeA.map((cellA, i) => new Pair(
  consecutiveKey, `Clone ${i}`, cellA, shapeB[i]));

return [
  new Shape('9x9'),

  new Given('R1C3', 9), new Given('R1C7', 2), new Given('R1C9', 8),
  new Given('R2C2', 1), new Given('R2C4', 3),
  new Given('R3C1', 7), new Given('R3C5', 1), new Given('R3C7', 9), new Given('R3C9', 5),
  new Given('R4C2', 7), new Given('R4C4', 5),
  new Given('R5C3', 3), new Given('R5C9', 1),
  new Given('R6C7', 7),
  new Given('R7C1', 3), new Given('R7C3', 4), new Given('R7C6', 5),
  new Given('R9C1', 2), new Given('R9C3', 5), new Given('R9C5', 9),

  ...clonePairs,
];
