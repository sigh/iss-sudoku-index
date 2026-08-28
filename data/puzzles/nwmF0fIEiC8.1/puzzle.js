// Title: Sept. 30, 2021: Sam-ish Sudoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=nwmF0fIEiC8
// Source: https://tinyurl.com/kc239h7s

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Four outside diagonal clues give the sum of the digits
// along the marked diagonal; per the rules text ("may include repeat
// digits") those digits may repeat, so each is a plain Sum, not a Cage.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Givens, transcribed from the grid.
const givens = [
  ['R1C6', 6], ['R1C8', 9],
  ['R2C7', 5], ['R2C9', 8],
  ['R3C6', 7], ['R3C8', 2],
  ['R4C5', 6], ['R4C7', 3], ['R4C9', 9],
  ['R5C4', 9], ['R5C6', 4],
  ['R6C3', 3], ['R6C5', 5],
  ['R7C2', 9], ['R7C4', 6],
  ['R8C1', 8], ['R8C3', 6],
  ['R9C1', 4], ['R9C2', 7],
].map(([cell, value]) => new Given(cell, value));

// Little-killer sums (payload `littlekillersum`, direction "DL" throughout):
// each entry's own `cells` array is the on-grid diagonal run from the badge,
// so the start cell and ray direction below reproduce it exactly.
const littleKillers = [
  LittleKiller.fromCells(10, graph.ray('R1C5', 1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(7, graph.ray('R5C9', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R7C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),

  ...givens,
  ...littleKillers,
];
