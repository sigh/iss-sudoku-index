// Title: Quality Street
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=oSG0c7PZ7ME
// Source: https://sudokupad.app/ml7764ol17

// Normal sudoku rules apply.
// On either main diagonal (thin blue line), digits may not repeat: both
// corner-to-corner diagonals are drawn.
// The 3x3 box borders divide each thick blue line into segments; each
// segment on a line has the same sum (RegionSumLine enforces equal sums
// across the box-boundary segments of one drawn line). Different lines may
// have different sums, so each line gets its own RegionSumLine.

const thickLines = [
  ['R1C4', 'R2C3', 'R3C3', 'R3C2', 'R4C1'],
  ['R6C9', 'R7C8', 'R7C7', 'R8C7', 'R9C6'],
  ['R8C6', 'R7C6', 'R7C5', 'R6C4', 'R5C3', 'R4C3', 'R4C2'],
  ['R6C8', 'R6C7', 'R5C7', 'R4C6', 'R3C5', 'R3C4'],
  ['R1C5', 'R2C6', 'R2C7', 'R1C7'],
  ['R7C2', 'R6C1', 'R5C1'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...thickLines.map(cells => new RegionSumLine(...cells)),
];
