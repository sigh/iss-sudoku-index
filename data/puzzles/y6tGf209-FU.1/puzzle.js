// Title: Nov. 19 2022: Region Sum Lines
// Author: clover!
// Video: https://www.youtube.com/watch?v=y6tGf209-FU
// Source: https://tinyurl.com/dvt63hzc

// Normal sudoku rules (default rows/cols/boxes). Six region sum lines: along
// each, the sum of the digits within each box segment the line passes
// through is equal (RegionSumLine splits a cell list into per-box runs
// automatically).

// Given digits, transcribed from the payload's fixed cells.
const givens = [
  ['R1C4', 1],
  ['R1C9', 3],
  ['R3C7', 6],
  ['R3C9', 4],
  ['R4C4', 8],
  ['R4C6', 1],
  ['R4C7', 4],
  ['R6C3', 1],
  ['R6C4', 9],
  ['R6C6', 2],
  ['R7C1', 1],
  ['R7C3', 7],
  ['R9C1', 3],
  ['R9C6', 6],
];

// Line cell lists transcribed from the payload's line paths.
const line1 = ['R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C6', 'R3C7', 'R3C8'];
const line2 = ['R7C2', 'R7C3', 'R7C4', 'R8C4', 'R9C4', 'R9C5', 'R9C6'];
const line3 = ['R8C5', 'R8C6', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C9'];
const line4 = ['R2C5', 'R2C4', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R1C1'];
const line5 = ['R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C8'];
const line6 = ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C2'];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  new RegionSumLine(...line1),
  new RegionSumLine(...line2),
  new RegionSumLine(...line3),
  new RegionSumLine(...line4),
  new RegionSumLine(...line5),
  new RegionSumLine(...line6),
];
