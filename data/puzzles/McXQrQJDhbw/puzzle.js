// Title: Perfectly Balanced
// Author: IcyFruit
// Video: https://www.youtube.com/watch?v=McXQrQJDhbw
// Source: https://sudokupad.app/ykcj1iv01r

// Normal sudoku rules apply.
// The nine blue lines are each RegionSumLine: box borders split a line into
// segments that must all share the same sum.
// The two edge marks are inequality pointers between adjacent cells: the
// arrowhead touches the smaller of the two digits, so each is GreaterThan
// (bigger cell first) between exactly the two cells the mark sits on.

return [
  new Shape('9x9'),

  new Given('R1C4', 9),
  new Given('R4C9', 2),
  new Given('R6C1', 5),
  new Given('R9C6', 6),

  // Edge mark 'v' on the R5C3/R6C3 border: the arrowhead points down, at the
  // smaller cell (R6C3). 'v' is '>' rotated 90deg clockwise, still pointing
  // at the smaller value, so the same "arrow points to the smaller digit"
  // rule applies rotated to a vertical edge.
  new GreaterThan('R5C3', 'R6C3'),
  // Edge mark '>' on the R8C8/R8C9 border: the arrowhead points right, at
  // the smaller cell (R8C9).
  new GreaterThan('R8C8', 'R8C9'),

  // Blue region-sum lines, one per drawn stroke (cell order from wayPoints).
  new RegionSumLine('R8C1', 'R8C2', 'R8C3', 'R7C4', 'R7C5', 'R7C6'),
  new RegionSumLine('R8C4', 'R8C5', 'R8C6', 'R9C7', 'R9C8', 'R9C9'),
  new RegionSumLine('R7C1', 'R7C2', 'R7C3', 'R6C4', 'R5C4', 'R4C4', 'R3C5', 'R2C5', 'R1C5'),
  new RegionSumLine('R3C7', 'R2C7', 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C6', 'R5C6', 'R6C6', 'R7C7', 'R7C8', 'R7C9', 'R6C9', 'R5C9', 'R5C8'),
  new RegionSumLine('R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new RegionSumLine('R1C2', 'R2C3', 'R2C4', 'R3C4', 'R3C3', 'R3C2'),
  new RegionSumLine('R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C2', 'R6C2'),
  new RegionSumLine('R6C7', 'R5C7', 'R4C7', 'R3C8', 'R2C9', 'R1C9'),
  // Two-cell line crossing a box border: forces its two cells equal (each is
  // its own single-cell segment, and both segments must share the same sum).
  new RegionSumLine('R3C9', 'R4C8'),
];
