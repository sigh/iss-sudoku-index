// Title: Emergence
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=yTqgT4A0a1g
// Source: https://sudokupad.app/n8GBhrHDhf

// Normal 9x9 Sudoku rules apply. Each blue line has equal digit sums in every
// consecutive 3x3-box segment; a re-entry to a box starts another segment.
// The cell paths below are transcribed from the six drawn blue lines.
return [
  new Shape('9x9'),
  new RegionSumLine('R8C7', 'R7C8', 'R6C9', 'R5C9', 'R5C8', 'R6C7', 'R6C8'),
  new RegionSumLine('R4C5', 'R4C4', 'R4C3', 'R4C2', 'R3C1', 'R2C1', 'R1C1', 'R1C2'),
  new RegionSumLine('R8C5', 'R7C4', 'R6C3', 'R5C2', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new RegionSumLine('R9C3', 'R8C3', 'R8C4', 'R9C5', 'R8C6', 'R7C6', 'R6C6', 'R6C5', 'R6C4'),
  new RegionSumLine('R2C2', 'R2C3', 'R3C4', 'R3C5', 'R2C5', 'R1C4'),
  new RegionSumLine('R3C8', 'R3C9', 'R2C8', 'R1C7', 'R1C6', 'R2C6', 'R3C6', 'R4C7', 'R4C8'),
];
