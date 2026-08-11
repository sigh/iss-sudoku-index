// Title: 6/20: Lixiviatin' on a Prayer
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=xnxQ8u5lspw
// Source: https://tinyurl.com/2p923dy6

// Normal sudoku rules apply (default row/column/box all-different). Digits in
// cages cannot repeat and must sum to the total given: Cage(sum, ...cells)
// bakes in both. Each region-sum line passes through more than one 3x3 box;
// the digits in every region (box) it passes through have the same sum:
// RegionSumLine(...cells) implements exactly this, splitting the ordered
// cell list into per-box runs as it walks the line. None of the lines below
// are closed loops, so no wrap-around handling is needed.

// Cage cells and totals transcribed from the drawn killer cages.
const cages = [
  [8, 'R2C2', 'R2C3'],
  [5, 'R3C1', 'R3C2'],
  [14, 'R3C3', 'R3C4'],
  [6, 'R2C7', 'R2C8'],
  [11, 'R3C6', 'R3C7'],
  [9, 'R3C8', 'R3C9'],
  [10, 'R4C8', 'R4C9'],
  [9, 'R5C8', 'R5C9'],
  [9, 'R6C7', 'R6C8'],
  [10, 'R7C6', 'R7C7'],
  [18, 'R8C4', 'R8C5', 'R8C6', 'R9C5'],
  [20, 'R4C4', 'R4C5', 'R4C6', 'R5C5'],
  [11, 'R4C1', 'R4C2'],
  [7, 'R5C1', 'R5C2'],
  [4, 'R6C2', 'R6C3'],
  [15, 'R7C3', 'R7C4'],
];

// Line cell paths transcribed from the drawn region-sum lines.
const regionSumLines = [
  ['R3C4', 'R2C3', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C2', 'R7C3', 'R8C4', 'R9C5', 'R8C6'],
  ['R7C7', 'R6C8', 'R5C9', 'R4C9', 'R3C9', 'R2C8', 'R2C7', 'R3C6', 'R4C5'],
  ['R3C3', 'R4C4'],
  ['R4C6', 'R3C7'],
  ['R5C2', 'R6C3', 'R7C4'],
  ['R8C5', 'R7C6', 'R6C7', 'R5C8'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
];
