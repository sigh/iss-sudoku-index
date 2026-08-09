// Title: Sep 12, 2022: Extra Regions
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=TRnCrYmrLZ8
// Source: https://tinyurl.com/2p85h2ux

// Normal sudoku rules apply. Each of the five grey regions below must also
// contain every digit 1-9 exactly once, encoded as an extra AllDifferent
// region alongside the standard rows/columns/boxes.

// Grey region cells, transcribed from the puzzle's drawn extra-region overlay.
const extraRegions = [
  ['R6C1', 'R6C2', 'R7C1', 'R8C1', 'R8C2', 'R8C4', 'R9C2', 'R9C3', 'R9C4'],
  ['R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C4', 'R3C1', 'R4C1', 'R4C2'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C8', 'R2C9', 'R3C9', 'R4C8', 'R4C9'],
  ['R6C8', 'R6C9', 'R7C9', 'R8C6', 'R8C8', 'R8C9', 'R9C6', 'R9C7', 'R9C8'],
  ['R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
];

const givens = [
  ['R2C3', 1], ['R2C7', 3],
  ['R3C2', 2], ['R3C3', 3], ['R3C4', 9], ['R3C6', 1], ['R3C7', 4], ['R3C8', 5],
  ['R4C3', 5], ['R4C4', 7], ['R4C6', 9], ['R4C7', 8],
  ['R6C3', 4], ['R6C4', 2], ['R6C6', 3], ['R6C7', 6],
  ['R7C2', 5], ['R7C3', 6], ['R7C4', 1], ['R7C6', 2], ['R7C7', 7], ['R7C8', 8],
  ['R8C3', 7], ['R8C7', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...extraRegions.map(cells => new AllDifferent(...cells)),
];
