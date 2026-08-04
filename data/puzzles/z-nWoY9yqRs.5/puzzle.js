// Title: Jorminigandr
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=z-nWoY9yqRs
// Source: https://tinyurl.com/2p8jyyxs

// Normal sudoku rules apply (standard rows/columns/boxes, handled by the
// solver baseline). The single drawn line requires an equal sum in every
// box it passes through, i.e. RegionSumLine (each 3-cell segment of the
// line inside a box sums to the same total N as every other box's segment).
// Line cells transcribed from the f-puzzles `line` layer (single entry,
// colour #ADD8E6).
const line = [
  'R1C9', 'R2C8', 'R3C7', 'R3C6', 'R2C5', 'R1C4', 'R1C3', 'R2C2', 'R3C1',
  'R4C1', 'R5C2', 'R6C3', 'R6C4', 'R5C5', 'R4C6', 'R4C7', 'R5C8', 'R6C9',
  'R7C9', 'R8C8', 'R9C7', 'R9C6', 'R8C5', 'R7C4', 'R7C3', 'R8C2', 'R9C1',
];

return [
  new Shape('9x9'),

  // Givens, transcribed from the grid.
  new Given('R1C2', 3), new Given('R1C8', 8),
  new Given('R2C1', 8), new Given('R2C3', 2), new Given('R2C5', 4),
  new Given('R2C7', 7), new Given('R2C9', 9),
  new Given('R3C2', 4), new Given('R3C8', 1),
  new Given('R5C2', 6), new Given('R5C5', 1), new Given('R5C8', 5),
  new Given('R7C2', 2), new Given('R7C8', 4),
  new Given('R8C1', 1), new Given('R8C3', 3), new Given('R8C5', 9),
  new Given('R8C7', 6), new Given('R8C9', 8),
  new Given('R9C2', 9), new Given('R9C8', 2),

  new RegionSumLine(...line),
];
