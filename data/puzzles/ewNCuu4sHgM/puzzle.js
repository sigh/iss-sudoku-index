// Title: Xmas-Sums
// Author: clover
// Video: https://www.youtube.com/watch?v=ewNCuu4sHgM
// Source: https://app.crackingthecryptic.com/sudoku/4rjdBRPmdF

// Normal sudoku rules apply (Shape('9x9') below already provides row, column
// and 3x3 box all-different).
// Each outside clue is a standard X-Sum: it equals the sum of the first X
// digits counted from that direction, where X is the first digit encountered
// from that direction. XSum.fromCells(value, cells, geometry) takes the lane
// as a cell list ordered nearest-clue-first, which fixes both the lane and
// the reading direction.

const geometry = cellGeometry('9x9');

const xsumLanes = [
  // top C2 -> 10 (overlay center [-0.5, 1.5]: row outside-top, col index 1)
  [10, ['R1C2', 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R9C2']],
  // left R2 -> 10 (overlay center [1.5, -0.5]: row index 1, col outside-left)
  [10, ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9']],
  // top C3 -> 24 (overlay center [-0.5, 2.5])
  [24, ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3']],
  // left R3 -> 38 (overlay center [2.5, -0.5])
  [38, ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9']],
  // top C4 -> 11 (overlay center [-0.5, 3.5])
  [11, ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4']],
  // top C6 -> 29 (overlay center [-0.5, 5.5])
  [29, ['R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C6', 'R8C6', 'R9C6']],
  // right R4 -> 31 (overlay center [3.5, 9.5]: row index 3, col outside-right)
  [31, ['R4C9', 'R4C8', 'R4C7', 'R4C6', 'R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1']],
  // right R6 -> 35 (overlay center [5.5, 9.5])
  [35, ['R6C9', 'R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2', 'R6C1']],
  // right R8 -> 27 (overlay center [7.5, 9.5])
  [27, ['R8C9', 'R8C8', 'R8C7', 'R8C6', 'R8C5', 'R8C4', 'R8C3', 'R8C2', 'R8C1']],
  // bottom C8 -> 8 (overlay center [9.5, 7.5]: row outside-bottom, col index 7)
  [8, ['R9C8', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R4C8', 'R3C8', 'R2C8', 'R1C8']],
  // bottom C9 -> 8 (overlay center [9.5, 8.5])
  [8, ['R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9']],
];

const xsums = xsumLanes.map(
  ([value, cells]) => XSum.fromCells(value, cells, geometry));

return [
  new Shape('9x9'),
  ...xsums,
];
