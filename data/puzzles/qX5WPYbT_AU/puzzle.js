// Title: Treasure Map
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=qX5WPYbT_AU
// Source: https://app.crackingthecryptic.com/sudoku/bm4T88nQmQ
//
// Normal sudoku rules apply (standard 3x3 boxes, no givens).
//
// Arrow: digits along the arrow sum to the 2-digit number in the connected
// pill. The pill is the rounded box spanning R6C8-R6C9 (read left to right,
// so R6C8 is the tens digit and R6C9 is the ones digit); the arrow line
// leaves the pill at R6C9 and snakes through 34 more cells before ending at
// R1C7. Encoded as a single PillArrow covering the pill and the full arm.
//
// X: the payload draws exactly one "X" overlay, centred on the corner shared
// by R1C5, R1C6, R2C5 and R2C6. "Pairs of digits diagonally adjacent to each
// other across the X sum to 10" is read as applying at that one drawn X (the
// rules use the definite article "the X", and only one X mark exists in the
// payload): the two diagonal pairs meeting at that corner, R1C5/R2C6 and
// R1C6/R2C5, each sum to 10.

const arrowArm = [
  'R7C9', 'R8C8', 'R9C8', 'R9C7', 'R9C6', 'R8C5', 'R8C4', 'R9C3', 'R9C2',
  'R8C1', 'R8C2', 'R8C3', 'R7C3', 'R6C4', 'R6C5', 'R5C4', 'R6C3', 'R7C2',
  'R6C2', 'R5C2', 'R4C1', 'R4C2', 'R3C2', 'R2C3', 'R3C4', 'R4C5', 'R3C6',
  'R3C7', 'R4C8', 'R3C8', 'R2C8', 'R1C9', 'R1C8', 'R1C7',
];

return [
  new Shape('9x9'),

  new PillArrow(2, 'R6C8', 'R6C9', ...arrowArm),

  new Sum(10, 'R1C5', 'R2C6'),
  new Sum(10, 'R1C6', 'R2C5'),
];
