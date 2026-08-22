// Title: Symbiosis
// Author: XeonRisq
// Video: https://www.youtube.com/watch?v=k84azF06Ql8
// Source: https://app.crackingthecryptic.com/sudoku/GjJn7rQMd4

// Standard sudoku (9x9, 3x3 boxes, no givens). Four killer cages (distinct
// digits, sum to the printed total). Six outside diagonal-sum arrows
// (LittleKiller): digits along the ray may repeat, since only cages forbid
// repeats.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

// Cage cells: the four drawn 3-cell killer cages.
const cages = [
  new Cage(20, 'R1C3', 'R1C4', 'R2C4'),
  new Cage(20, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(19, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(19, 'R6C8', 'R6C9', 'R7C9'),
];

// Diagonal sum arrows: each off-grid arrow's own drawn direction gives the
// cell it enters the grid at and the heading of its ray.
const littleKillers = [
  LittleKiller.fromCells(27, graph.ray('R6C1', 1, 1), geometry),
  LittleKiller.fromCells(25, graph.ray('R3C1', 1, 1), geometry),
  LittleKiller.fromCells(60, graph.ray('R1C3', 1, 1), geometry),
  LittleKiller.fromCells(18, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(18, graph.ray('R3C9', 1, -1), geometry),
  LittleKiller.fromCells(16, graph.ray('R6C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...littleKillers,
];
