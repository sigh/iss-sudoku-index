// Title: September 13, 2022: Summetry
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=TRnCrYmrLZ8
// Source: https://tinyurl.com/yc36n8fv

// Normal sudoku (default row/col/box). Lines: RegionSumLine (each line
// passes through more than one 3x3 box; the digits in every box it
// passes through have the same sum -- rules text's worked example
// r1c3 = r1c4+r1c5+r1c6 = r1c7+r1c8 confirms the box-segmentation
// reading, matching line #1 below).

return [
  new Shape('9x9'),

  // Givens (printed digits).
  new Given('R1C1', 9),
  new Given('R1C6', 4),
  new Given('R1C9', 5),
  new Given('R3C2', 3),
  new Given('R4C9', 1),
  new Given('R6C1', 1),
  new Given('R7C8', 3),
  new Given('R9C1', 5),
  new Given('R9C4', 4),
  new Given('R9C9', 9),

  // Region-sum lines (drawn line geometry).
  new RegionSumLine('R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new RegionSumLine('R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2'),
  new RegionSumLine('R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'),
  new RegionSumLine('R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new RegionSumLine('R2C7', 'R2C8', 'R3C8', 'R4C8'),
  new RegionSumLine('R6C2', 'R7C2', 'R8C2', 'R8C3'),
  new RegionSumLine('R2C4', 'R2C3', 'R2C2', 'R3C2'),
  new RegionSumLine('R8C6', 'R8C7', 'R8C8', 'R7C8'),
  new RegionSumLine('R7C6', 'R6C7', 'R5C7'),
  new RegionSumLine('R3C4', 'R4C3', 'R5C3'),
  new RegionSumLine('R6C3', 'R7C4', 'R7C5'),
  new RegionSumLine('R3C5', 'R3C6', 'R4C7', 'R5C6', 'R6C5', 'R6C4'),
];
