// Title: Oct 26, 2021: Extra Regions
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=X1R8MPhNwrg
// Source: https://tinyurl.com/sykpryax

// Standard Sudoku rules apply. Additionally, each of three shaded regions
// (9 cells each) must contain the digits 1-9 exactly once; encoded as
// AllDifferent over each region's cells, which is equivalent to a
// one-to-one placement of 1-9 given the region has exactly 9 cells.
const givens = [
  ['R1C8', 1], ['R1C9', 2],
  ['R2C2', 1], ['R2C3', 2], ['R2C9', 3],
  ['R3C2', 3], ['R3C3', 4], ['R3C6', 2], ['R3C7', 5],
  ['R4C4', 1], ['R4C6', 5],
  ['R6C4', 2], ['R6C6', 9],
  ['R7C3', 3], ['R7C4', 8], ['R7C7', 6], ['R7C8', 7],
  ['R8C1', 7], ['R8C7', 8], ['R8C8', 9],
  ['R9C1', 8], ['R9C2', 9],
];

// Shaded regions, transcribed from the payload's `extraregion` list.
const extraRegions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...extraRegions.map(cells => new AllDifferent(...cells)),
];
