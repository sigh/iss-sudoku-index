// Title: Wingspan
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=k7MMOd13AdQ
// Source: https://sudokupad.app/yj1g5x7n9f

// Normal sudoku rules apply. The 3x3 box borders divide each blue line into
// segments; along an individual line each of those segments must have the
// same sum. Nine such region-sum lines are drawn; each is encoded as one
// RegionSumLine, which natively enforces equal sums per box segment
// (including repeat visits to the same box).

return [
  new Shape('9x9'),

  new RegionSumLine(
    'R4C6', 'R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new RegionSumLine(
    'R6C7', 'R6C8', 'R7C8', 'R8C8', 'R8C7', 'R8C6', 'R7C6'),
  new RegionSumLine(
    'R5C3', 'R6C2', 'R7C2'),
  new RegionSumLine(
    'R6C3', 'R7C3', 'R8C2'),
  new RegionSumLine(
    'R3C5', 'R2C6', 'R2C7'),
  new RegionSumLine(
    'R3C6', 'R3C7', 'R2C8'),
  new RegionSumLine(
    'R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1',
    'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new RegionSumLine(
    'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9',
    'R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
  // Closed loop; the box containing the loop's start cell (R2C4) differs
  // from the box containing its end cell (R2C3), so listing it as an open
  // path gives the same segment boundaries as the drawn loop.
  new RegionSumLine(
    'R2C4', 'R3C4', 'R4C5', 'R5C4', 'R4C3', 'R4C2', 'R3C2', 'R2C2', 'R2C3'),
];
