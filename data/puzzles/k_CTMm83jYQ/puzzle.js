// Title: Diamond
// Author: zetamath
// Video: https://www.youtube.com/watch?v=k_CTMm83jYQ
// Source: https://app.crackingthecryptic.com/sudoku/n6tP7pMpNf

// Normal sudoku rules apply (standard 3x3 boxes). Two givens.
// 12 cells are marked with a circle. 17 lines each connect two circles
// (with 1-3 plain cells between them); the digits on a line's non-circle
// cells sum to the sum of the digits in its two end circles. Digits may
// repeat along a line and its circles (no distinctness is stated).
// DoubleArrow expresses exactly this: sum of the first/last (circle) cells
// equals the sum of the cells between them. Lines 6 and 7 are drawn as
// straight diagonals through the centre of one plain cell (R5C6, R5C4
// respectively) rather than an orthogonal path -- read from the waypoint
// geometry, since a straight segment's midpoint cell is on the line even
// with no explicit waypoint there.

return [
  new Shape('9x9'),

  new Given('R8C7', 4),
  new Given('R9C8', 5),

  new DoubleArrow('R1C5', 'R1C4', 'R2C4'),
  new DoubleArrow('R1C5', 'R1C6', 'R2C6'),
  new DoubleArrow('R2C6', 'R2C7', 'R3C7', 'R4C7'),
  new DoubleArrow('R2C4', 'R2C3', 'R3C3', 'R4C3'),
  new DoubleArrow('R4C5', 'R5C5', 'R6C5'),
  new DoubleArrow('R6C5', 'R5C6', 'R4C7'),
  new DoubleArrow('R6C5', 'R5C4', 'R4C3'),
  new DoubleArrow('R4C3', 'R4C2', 'R5C2', 'R6C1'),
  new DoubleArrow('R4C3', 'R3C4', 'R3C5', 'R3C6', 'R4C7'),
  new DoubleArrow('R4C7', 'R4C8', 'R5C8', 'R6C9'),
  new DoubleArrow('R6C1', 'R7C1', 'R7C2', 'R7C3'),
  new DoubleArrow('R6C9', 'R7C9', 'R7C8', 'R7C7'),
  new DoubleArrow('R7C7', 'R7C6', 'R8C6', 'R9C6', 'R9C5'),
  new DoubleArrow('R7C3', 'R7C4', 'R8C4', 'R9C4', 'R9C5'),
  new DoubleArrow('R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new DoubleArrow('R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5'),
  new DoubleArrow('R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'),
];
