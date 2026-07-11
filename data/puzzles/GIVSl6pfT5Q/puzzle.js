// Title: Blue Caterpillars
// Author: Arachno
// Video: https://www.youtube.com/watch?v=GIVSl6pfT5Q
// Source: https://sudokupad.app/xnt9jxy2an

// Normal sudoku rules apply. The 3x3 box borders divide a blue line into
// segments; each segment along an individual line must have the same sum.
//
// RegionSumLine already enforces this rule natively: values on the line
// have an equal sum within each box it passes through, with each visit to
// a box treated as a separate segment when a line revisits a box.

return [
  new Shape('9x9'),

  new RegionSumLine(
    'R1C4', 'R2C4', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R2C2'),
  new RegionSumLine(
    'R6C9', 'R6C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R8C8'),
  new RegionSumLine(
    'R4C2', 'R5C2', 'R5C3', 'R6C4', 'R7C5', 'R8C5', 'R8C6'),
  new RegionSumLine(
    'R6C1', 'R7C2', 'R8C2'),
  new RegionSumLine(
    'R3C4', 'R3C5', 'R4C5', 'R4C6'),
  new RegionSumLine(
    'R2C6', 'R1C6', 'R2C7', 'R3C8'),
];
