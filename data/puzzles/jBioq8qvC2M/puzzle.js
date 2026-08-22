// Title: Nine o'Clock
// Author: Ankan Bhattacharya
// Video: https://www.youtube.com/watch?v=jBioq8qvC2M
// Source: https://app.crackingthecryptic.com/sudoku/BFRF9D8QjP

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Nine 3-cell cages, one per box, each sum to 9 with no
// repeated digit inside the cage. Three outside badges give the sum of the
// digits along a diagonal running into the grid; repeats are allowed on
// that diagonal except where row/column/box all-different already forbids
// them.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Outside diagonal-sum clues, transcribed from source-assets: each arrow's
// own drawn heading (not the badge's horizontal position, which for two of
// the three sits equidistant between adjacent columns) fixes the diagonal.
const littleKillers = [
  LittleKiller.fromCells(29, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(21, graph.ray('R1C6', 1, 1), geometry),
  LittleKiller.fromCells(58, graph.ray('R1C7', 1, -1), geometry),
];

// Killer cages (sum + all-different), one per box, transcribed from the
// drawn cages. Each occupies its box's top-right/bottom-left/bottom-right
// corner triple (box's own top-left 2x2 corner minus its outermost cell).
const cages = [
  new Cage(9, 'R2C2', 'R2C1', 'R1C2'),
  new Cage(9, 'R1C5', 'R2C5', 'R2C4'),
  new Cage(9, 'R1C8', 'R2C8', 'R2C7'),
  new Cage(9, 'R4C2', 'R5C2', 'R5C1'),
  new Cage(9, 'R4C5', 'R5C5', 'R5C4'),
  new Cage(9, 'R4C8', 'R5C8', 'R5C7'),
  new Cage(9, 'R7C2', 'R8C2', 'R8C1'),
  new Cage(9, 'R7C5', 'R8C5', 'R8C4'),
  new Cage(9, 'R7C8', 'R8C8', 'R8C7'),
];

return [
  new Shape('9x9'),

  ...littleKillers,
  ...cages,
];
