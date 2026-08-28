// Title: Nov 28, 2021: Irregular Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=4BA_LntMqbA
// Source: https://tinyurl.com/4vfdtwam

// Normal 9x9 irregular (jigsaw) sudoku: place 1-9 once each in every row,
// column, and outlined region. No other rules. The 9 outlined regions
// replace the default 3x3 boxes, so the default box groups are dropped.

// Givens, transcribed from the payload's given cells.
const givens = [
  new Given('R1C1', 3), new Given('R1C2', 2), new Given('R1C3', 4), new Given('R1C4', 1), new Given('R1C9', 5),
  new Given('R2C9', 4),
  new Given('R3C6', 7), new Given('R3C9', 3),
  new Given('R4C3', 8), new Given('R4C4', 5), new Given('R4C6', 6), new Given('R4C9', 1),
  new Given('R6C1', 1), new Given('R6C4', 8), new Given('R6C6', 4), new Given('R6C7', 7),
  new Given('R7C1', 4), new Given('R7C4', 6),
  new Given('R8C1', 2),
  new Given('R9C1', 5), new Given('R9C6', 1), new Given('R9C7', 4), new Given('R9C8', 3), new Given('R9C9', 2),
];

// The 9 jigsaw regions, transcribed from the payload's grid: each cell's
// `region` field where present, and its default 3x3 box (f-puzzles
// convention: a cell without an explicit `region` keeps the box its
// position implies) where absent. Filling the gaps this way yields exactly
// 9 regions of 9 cells, confirming the fill is complete and consistent.
const regionCells = [
  ['R3C5', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5'],
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R4C1', 'R5C1'],
  ['R5C9', 'R6C9', 'R7C7', 'R7C8', 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C9', 'R3C7', 'R3C9'],
  ['R7C1', 'R7C3', 'R8C1', 'R8C3', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R2C8', 'R3C8', 'R4C7', 'R4C8', 'R4C9', 'R5C8', 'R6C6', 'R6C7', 'R6C8'],
  ['R6C4', 'R7C4', 'R7C6', 'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R9C6'],
  ['R4C2', 'R4C3', 'R4C4', 'R5C2', 'R6C1', 'R6C2', 'R6C3', 'R7C2', 'R8C2'],
  ['R1C4', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C4', 'R3C6', 'R4C6'],
];
const regions = regionCells.map(cells => new Jigsaw('9x9', ...cells));

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...givens,
  ...regions,
];
