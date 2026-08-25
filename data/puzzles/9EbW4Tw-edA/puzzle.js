// Title: Extra Regions Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9EbW4Tw-edA
// Source: https://app.crackingthecryptic.com/rjnmTgdPrG

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's
// `regions`). In each shaded region, the numbers 1 to 9 must appear once
// each; with exactly 9 cells per region and 9 possible digits, AllDifferent
// enforces that. Region cells transcribed from the payload's 36 `underlays`
// (light-gray 1x1 shapes), grouped into 4 contiguous 9-cell clusters by grid
// adjacency.
const givens = [
  ['R1C1', 2], ['R1C2', 3], ['R1C8', 4], ['R1C9', 5],
  ['R2C1', 1], ['R2C8', 3], ['R2C9', 6],
  ['R3C7', 1],
  ['R4C5', 7],
  ['R5C2', 7], ['R5C4', 8], ['R5C6', 9], ['R5C8', 1],
  ['R6C5', 1],
  ['R7C3', 2],
  ['R8C1', 3], ['R8C2', 1], ['R8C9', 4],
  ['R9C1', 4], ['R9C2', 5], ['R9C8', 7], ['R9C9', 3],
];

const shadedRegions = [
  ['R1C3', 'R2C2', 'R2C3', 'R2C4', 'R3C1', 'R3C2', 'R3C4', 'R4C2', 'R4C3'],
  ['R1C6', 'R1C7', 'R2C6', 'R3C6', 'R3C9', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R6C7', 'R6C8', 'R7C6', 'R7C8', 'R7C9', 'R8C6', 'R8C7', 'R8C8', 'R9C7'],
  ['R6C1', 'R6C2', 'R6C3', 'R6C4', 'R7C1', 'R7C4', 'R8C4', 'R9C3', 'R9C4'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...shadedRegions.map(cells => new AllDifferent(...cells)),
];
