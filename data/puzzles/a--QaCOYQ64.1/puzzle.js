// Title: June 21, 2023: Shuriken
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=a--QaCOYQ64
// Source: https://tinyurl.com/yc5t49t4

// Normal 8x8 irregular (jigsaw) sudoku: place 1-8 once each in every row,
// column, and outlined region. No other rules. The 8 outlined regions
// replace the default 2x4 boxes, so the default box groups are dropped.

// Givens, transcribed from the payload's given cells.
const givens = [
  new Given('R1C1', 1), new Given('R1C6', 8), new Given('R1C8', 7),
  new Given('R2C2', 2), new Given('R2C7', 6),
  new Given('R3C3', 3), new Given('R3C8', 5),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C1', 4), new Given('R6C6', 6),
  new Given('R7C2', 3), new Given('R7C7', 7),
  new Given('R8C1', 2), new Given('R8C3', 1), new Given('R8C8', 8),
];

// The 8 jigsaw regions, transcribed from the payload's grid: each cell's
// `region` field where present, and its default 2x4 box (f-puzzles
// convention: a cell without an explicit `region` keeps the box its
// position implies) where absent. Filling the gaps this way yields exactly
// 8 regions of 8 cells, confirming the fill is complete and consistent.
const regionCells = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8'],
  ['R6C7', 'R6C8', 'R7C7', 'R7C8', 'R8C5', 'R8C6', 'R8C7', 'R8C8'],
  ['R5C1', 'R6C1', 'R7C1', 'R7C2', 'R7C3', 'R8C1', 'R8C2', 'R8C3'],
  ['R1C5', 'R2C3', 'R2C4', 'R2C5', 'R3C4', 'R3C5', 'R3C6', 'R4C4'],
  ['R3C7', 'R4C5', 'R4C6', 'R4C7', 'R5C6', 'R5C7', 'R5C8', 'R6C6'],
  ['R5C5', 'R6C3', 'R6C4', 'R6C5', 'R7C4', 'R7C5', 'R7C6', 'R8C4'],
  ['R3C3', 'R4C1', 'R4C2', 'R4C3', 'R5C2', 'R5C3', 'R5C4', 'R6C2'],
];
const regions = regionCells.map(cells => new Jigsaw('8x8', ...cells));

return [
  new Shape('8x8'),
  new NoBoxes(),
  ...givens,
  ...regions,
];
