// Title: 2/14/23: XY-Difference Pairs
// Author: clover!
// Video: https://www.youtube.com/watch?v=vuq-IhtnG-U
// Source: https://tinyurl.com/3t4kkxb6

// Normal sudoku rules apply (default 3x3 boxes; the payload's grid cells
// carry no `region` overrides, so all boxes stay default).
//
// Diamonds are the payload's `rectangle` entries (angle: 45), each straddling
// the shared border of two orthogonally adjacent cells. A horizontal
// diamond's two cells differ by the leftmost digit of that row (R{row}C1); a
// vertical diamond's two cells differ by the topmost digit of that column
// (R1C{col}). "Not all possible diamonds are necessarily given" is read as
// the standard negative-constraint caveat -- an undrawn adjacency is simply
// unconstrained, never forced to differ from the reference digit.

// abs(a - b) == ref, as an Or of the two equal-sum readings a = b + ref and
// b = a + ref, since a diamond's difference may run either way.
function diamond(a, b, ref) {
  return new Or([
    new EqualSum([a], [b, ref]),
    new EqualSum([b], [a, ref]),
  ]);
}

// Horizontal diamonds: [row, leftCol, rightCol]. Transcribed from the
// `rectangle` array's angle:45 entries whose two cells share a row.
const horizontalDiamonds = [
  [1, 3, 4],
  [1, 4, 5],
  [3, 2, 3],
  [4, 4, 5],
  [4, 6, 7],
  [5, 8, 9],
  [6, 5, 6],
  [7, 3, 4],
  [9, 7, 8],
];

// Vertical diamonds: [col, topRow, bottomRow]. Transcribed from the
// `rectangle` array's angle:45 entries whose two cells share a column.
const verticalDiamonds = [
  [1, 3, 4],
  [1, 4, 5],
  [3, 2, 3],
  [4, 4, 5],
  [4, 6, 7],
  [5, 8, 9],
  [6, 5, 6],
  [7, 3, 4],
  [9, 7, 8],
];

const horizontal = horizontalDiamonds.map(
  ([row, leftCol, rightCol]) => diamond(
    makeCellId(row, leftCol), makeCellId(row, rightCol), makeCellId(row, 1)));

const vertical = verticalDiamonds.map(
  ([col, topRow, bottomRow]) => diamond(
    makeCellId(topRow, col), makeCellId(bottomRow, col), makeCellId(1, col)));

return [
  new Shape('9x9'),

  new Given('R1C3', 8),
  new Given('R1C5', 2),
  new Given('R2C2', 6),
  new Given('R3C1', 7),
  new Given('R4C4', 7),
  new Given('R5C1', 1),
  new Given('R5C9', 4),
  new Given('R6C6', 9),
  new Given('R7C9', 1),
  new Given('R8C8', 3),
  new Given('R9C5', 7),
  new Given('R9C7', 2),

  ...horizontal,
  ...vertical,
];
