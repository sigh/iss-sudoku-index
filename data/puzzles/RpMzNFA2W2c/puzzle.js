// Title: Central Difference Method
// Author: JMoat13
// Video: https://www.youtube.com/watch?v=RpMzNFA2W2c
// Source: https://tinyurl.com/CenterOfTheMoat

// Normal sudoku rules apply.
// Adjacent digits separated by a diamond differ by "X", where X is the digit
// in the first cell of the row/column the diamond occupies: for a
// horizontal (same-row) diamond that is column 1 of its row; for a vertical
// (same-column) diamond that is row 1 of its column.

// Diamond pairs, transcribed from the puzzle's drawn diamond markers (each
// is a 45-degree-rotated marker straddling the listed two adjacent cells).
const diamonds = [
  ['R1C1', 'R2C1'],
  ['R2C1', 'R2C2'],
  ['R1C5', 'R1C4'],
  ['R1C5', 'R1C6'],
  ['R4C1', 'R5C1'],
  ['R5C1', 'R6C1'],
  ['R9C7', 'R9C8'],
  ['R9C8', 'R9C9'],
  ['R6C9', 'R5C9'],
  ['R4C9', 'R5C9'],
  ['R6C4', 'R5C4'],
  ['R4C4', 'R4C5'],
  ['R4C6', 'R5C6'],
  ['R6C5', 'R6C6'],
  ['R7C4', 'R8C4'],
  ['R8C6', 'R7C6'],
  ['R7C8', 'R7C9'],
  ['R6C8', 'R6C9'],
  ['R7C1', 'R7C2'],
  ['R7C2', 'R8C2'],
  ['R3C9', 'R3C8'],
];

// For each diamond, find the first cell of the row/column it occupies, and
// encode |a - b| == refValue as the disjunction of the two ways to remove the
// absolute value: a = b + ref, or b = a + ref. Each is a plain segment-sum
// equality (EqualSum), not a comparison against a fixed total, because ref is
// itself a grid cell. This also correctly handles the self-referential cases
// where the "first cell" coincides with one of the diamond's own two cells
// (e.g. R1C1,R2C1: ref is R1C1 itself), since both equalities are still
// evaluated and only the consistent one survives.
const diamondConstraints = diamonds.map(([a, b]) => {
  const A = parseCellId(a);
  const B = parseCellId(b);
  let ref;
  if (A.row === B.row) {
    // Horizontal pair: diamond occupies this row; first cell is column 1.
    ref = makeCellId(A.row, 1);
  } else {
    // Vertical pair: diamond occupies this column; first cell is row 1.
    ref = makeCellId(1, A.col);
  }
  return new Or([
    new EqualSum([a], [b, ref]),
    new EqualSum([b], [a, ref]),
  ]);
});

return [
  new Shape('9x9'),
  ...diamondConstraints,
];
