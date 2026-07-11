// Title: Shrinkflation
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=00bV9KL-kco
// Source: https://sudokupad.app/erin-toler/shrinkflation

// Normal sudoku rules apply (default row/column/box all-different).

// Blue lines: box borders divide each line into segments with the same sum;
// different lines may have different sums. RegionSumLine already implements
// exactly this semantics (equal sum per box-crossing segment) against the
// default box regions.
const blueLines = [
  ['R3C1', 'R4C2', 'R4C3', 'R5C3', 'R6C4'],
  ['R6C1', 'R6C2', 'R7C3'],
  ['R9C3', 'R8C4', 'R7C4', 'R7C5', 'R6C6'],
  ['R7C9', 'R6C8', 'R6C7', 'R5C7', 'R4C6'],
  ['R5C9', 'R4C8', 'R3C9'],
  ['R1C7', 'R2C6', 'R3C6', 'R3C5', 'R4C4'],
  ['R2C4', 'R3C3'],
  ['R8C7', 'R8C6', 'R9C5'],
];

// Inequality sign points to the lower of the two digits it sits between.
// The single sign sits on the edge between R1C1 and R2C1, pointing up
// (toward R1C1): R1C1 < R2C1, i.e. R2C1 > R1C1.
return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  new GreaterThan('R2C1', 'R1C1'),
];
