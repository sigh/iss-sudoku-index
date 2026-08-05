// Title: Regional Conflict
// Author: Chilly
// Video: https://www.youtube.com/watch?v=uLudj8M7VWc
// Source: https://tinyurl.com/chilly-regconflict

// Normal Sudoku rules apply. Each blue Region Sum Line has equal digit sums on
// every consecutive visit to a 3x3 box. Fog of war is UI-only.
// Blue paths transcribed from the declared Region Sum Lines and their connected
// blue closing/extension strokes. The first two are closed walks, rotated so
// the visit crossing the array boundary remains one contiguous box segment.
const regionSumLines = [
  ['R7C5', 'R6C5', 'R5C4', 'R6C4'],
  ['R3C5', 'R4C5', 'R4C4'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8', 'R4C9'],
  ['R6C8', 'R6C7', 'R6C6', 'R7C7', 'R7C6', 'R8C5'],
  ['R8C6', 'R8C7', 'R8C8', 'R9C9'],
  ['R2C8', 'R3C7', 'R4C6', 'R4C7', 'R4C8', 'R3C9'],
  ['R1C7', 'R2C6', 'R2C5', 'R3C4', 'R4C3'],
  ['R5C2', 'R6C2', 'R6C3', 'R7C4', 'R8C4'],
  ['R6C1', 'R7C2', 'R8C3', 'R9C4', 'R9C5'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R1C1', 'R2C2', 'R1C3', 'R2C4', 'R1C5'],
  ['R2C3', 'R3C2', 'R4C3'],
];

return [
  new Shape('9x9'),
  new Given('R4C6', 4),
  ...regionSumLines.map(cells => new RegionSumLine(...cells)),
];
