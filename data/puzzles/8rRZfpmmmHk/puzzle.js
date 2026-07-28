// Title: Nightcap
// Author: Cris Moore
// Video: https://www.youtube.com/watch?v=8rRZfpmmmHk
// Source: https://sudokupad.app/DmJnNPtQBH

// Standard 6x6 sudoku with 3x2 boxes, no givens. Each outside label is an
// X-sum and sandwich clue for its column, plus a little killer diagonal:
// 6 is above C4 and uses R1C3-R3C1; 9 is below C3 and uses R6C4-R4C6.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

const xSums = [
  XSum.fromCells(6, graph.column(4), geometry),
  XSum.fromCells(9, graph.column(3).reverse(), geometry),
];

const sandwiches = [
  Sandwich.fromCells(6, graph.column(4), geometry),
  Sandwich.fromCells(9, graph.column(3).reverse(), geometry),
];

const littleKillers = [
  LittleKiller.fromCells(6, graph.ray('R1C3', 1, -1), geometry),
  LittleKiller.fromCells(9, graph.ray('R6C4', -1, 1), geometry),
];

return [
  new Shape('6x6'),
  ...xSums,
  ...sandwiches,
  ...littleKillers,
];
