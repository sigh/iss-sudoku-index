// Title: Regional Mess
// Author: Souradip Das
// Video: https://www.youtube.com/watch?v=d8z973jgo6U
// Source: https://sudokupad.app/yx73bymmy1

// Normal sudoku rules apply. Box borders divide a blue line into segments
// with the same sum: each time a blue line crosses a box border it is cut
// into segments, and every segment of that line must sum to the same total.
// On a white dot the two digits are consecutive; on a black dot one digit is
// double the other.

return [
  new Shape('9x9'),

  // Region sum lines (blue).
  new RegionSumLine('R1C6', 'R1C7', 'R1C8'),
  new RegionSumLine('R1C3', 'R1C4', 'R2C5', 'R3C6', 'R4C6'),
  new RegionSumLine('R2C4', 'R3C3', 'R4C2', 'R5C1'),
  new RegionSumLine('R4C1', 'R3C1', 'R2C2'),
  new RegionSumLine('R5C3', 'R5C4', 'R5C5', 'R4C5', 'R3C5'),
  new RegionSumLine('R6C1', 'R7C1', 'R8C2'),
  new RegionSumLine('R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7'),
  new RegionSumLine('R3C9', 'R4C9', 'R5C8', 'R6C7', 'R7C6'),

  // Kropki dots.
  new WhiteDot('R2C7', 'R2C8'),
  new WhiteDot('R8C8', 'R9C8'),
  new BlackDot('R7C7', 'R8C7'),
];
