// Title: 7/8/22: Your Grid A Splode
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=PHOuWUax7J8
// Source: https://tinyurl.com/3trwxzwj

// Normal sudoku rules apply (standard 9x9 grid, default boxes).
// There are lines in the grid, each passing through more than one 3x3 box.
// Along each line, the digits in every box it passes through have the same
// sum: RegionSumLine enforces exactly this -- an equal running sum per
// contiguous same-box segment of the line, walked in list order. Two lines
// (R6C4-R7C3 and R3C7-R4C6) split into two single-cell segments, so
// RegionSumLine reduces those pairs to plain equality.

return [
  new Shape('9x9'),

  // Givens, transcribed from the puzzle grid.
  new Given('R1C6', 5),
  new Given('R1C8', 2),
  new Given('R1C9', 8),
  new Given('R2C5', 3),
  new Given('R3C3', 7),
  new Given('R3C7', 1),
  new Given('R4C1', 6),
  new Given('R5C2', 4),
  new Given('R5C8', 6),
  new Given('R6C9', 4),
  new Given('R7C3', 2),
  new Given('R7C7', 8),
  new Given('R8C5', 5),
  new Given('R9C1', 7),
  new Given('R9C2', 1),
  new Given('R9C4', 3),

  // Lines (15), transcribed in the order drawn.
  new RegionSumLine('R3C4', 'R2C3', 'R1C2'),
  new RegionSumLine('R3C6', 'R2C7', 'R1C8'),
  new RegionSumLine('R4C7', 'R3C8', 'R2C9'),
  new RegionSumLine('R6C7', 'R7C8', 'R8C9'),
  new RegionSumLine('R7C6', 'R8C7', 'R9C8'),
  new RegionSumLine('R7C4', 'R8C3', 'R9C2'),
  new RegionSumLine('R6C3', 'R7C2', 'R8C1'),
  new RegionSumLine('R4C3', 'R3C2', 'R2C1'),
  new RegionSumLine('R5C4', 'R5C3', 'R5C2'),
  new RegionSumLine('R4C5', 'R3C5', 'R2C5'),
  new RegionSumLine('R5C6', 'R5C7', 'R5C8'),
  new RegionSumLine('R6C5', 'R7C5', 'R8C5'),
  new RegionSumLine('R2C2', 'R3C3', 'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R8C8'),
  new RegionSumLine('R6C4', 'R7C3'),
  new RegionSumLine('R4C6', 'R3C7'),
];
