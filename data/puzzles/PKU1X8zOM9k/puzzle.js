// Title: Penghu County
// Author: Myxo
// Video: https://www.youtube.com/watch?v=PKU1X8zOM9k
// Source: https://sudokupad.app/tom2r4079i

// Normal sudoku rules apply. No given digits.
//
// Region Sum Lines: box borders divide each blue line into segments; the
// digits on every segment of the same line sum to the same total. Each line
// is drawn twice, in grey and in powder-blue, tracing the identical cells;
// this is one line per path, not two.
//
// Arrows: the digits along an arrow sum to the digit in its attached circle.

const regionSumLines = [
  // Diagonal r+c=9 (1-indexed).
  new RegionSumLine(
    'R8C1', 'R7C2', 'R6C3', 'R5C4', 'R4C5', 'R3C6', 'R2C7', 'R1C8'),
  // Diagonal r+c=8.
  new RegionSumLine('R7C1', 'R6C2', 'R5C3', 'R4C4', 'R3C5', 'R2C6', 'R1C7'),
  // Diagonal r+c=11.
  new RegionSumLine(
    'R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7', 'R3C8', 'R2C9'),
  // Diagonal r+c=12.
  new RegionSumLine('R9C3', 'R8C4', 'R7C5', 'R6C6', 'R5C7', 'R4C8', 'R3C9'),
];

const arrows = [
  new Arrow('R8C5', 'R7C6', 'R6C7', 'R5C8'),
  new Arrow('R8C8', 'R8C9', 'R9C9', 'R9C8'),
  new Arrow('R2C3', 'R2C2', 'R3C2', 'R4C2'),
];

return [
  new Shape('9x9'),
  ...regionSumLines,
  ...arrows,
];
