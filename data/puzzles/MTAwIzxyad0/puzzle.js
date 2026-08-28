// Title: Neighbours Sum Sudoku
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=MTAwIzxyad0
// Source: https://cracking-the-cryptic.web.app/sudoku/8DqptNjGng

// Standard sudoku rules on the default 9x9 grid/boxes. No digits are given.
//
// Blue cells (from the payload's deepskyblue underlays): each blue cell's
// digit equals the sum of the digits in its orthogonal in-grid neighbours
// (2 neighbours at a grid corner, 3 on a grid edge, 4 in the interior).
// Arrow(blueCell, ...neighbours) states this directly: the first cell is the
// circle (the sum) and the rest are the arm cells summed into it.

const NEIGHBOUR_SUMS = [
  ['R1C1', 'R1C2', 'R2C1'], // corner
  ['R1C4', 'R1C3', 'R1C5', 'R2C4'], // top edge
  ['R1C9', 'R1C8', 'R2C9'], // corner
  ['R3C3', 'R2C3', 'R4C3', 'R3C2', 'R3C4'], // interior
  ['R3C6', 'R2C6', 'R4C6', 'R3C5', 'R3C7'], // interior
  ['R4C9', 'R3C9', 'R5C9', 'R4C8'], // right edge
  ['R7C1', 'R6C1', 'R8C1', 'R7C2'], // left edge
  ['R8C9', 'R7C9', 'R9C9', 'R8C8'], // right edge
  ['R9C1', 'R8C1', 'R9C2'], // corner
  ['R9C3', 'R8C3', 'R9C2', 'R9C4'], // bottom edge
  ['R9C5', 'R8C5', 'R9C4', 'R9C6'], // bottom edge
];

const neighbourSums = NEIGHBOUR_SUMS.map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...neighbourSums,
];
