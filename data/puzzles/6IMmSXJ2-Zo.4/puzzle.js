// Title: Oct. 11, 20023: Oct. 10, 2023
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=6IMmSXJ2-Zo
// Source: https://tinyurl.com/jt9xx38m

// Normal sudoku rules apply. X-Sum clues give the sum of the first X digits,
// read from the clue side, where X is the adjacent digit. The givens and
// X-Sum clue positions and totals are transcribed from the source payload.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const givens = [
  ['R1C7', 3], ['R2C5', 1], ['R3C6', 9], ['R4C6', 2],
  ['R5C3', 4], ['R5C5', 5], ['R5C7', 6], ['R6C4', 8],
  ['R7C4', 1], ['R8C5', 9], ['R9C3', 7],
];

const xSums = [
  XSum.fromCells(10, graph.column(3), geometry),
  XSum.fromCells(10, graph.column(5), geometry),
  XSum.fromCells(20, graph.column(7), geometry),
  XSum.fromCells(23, graph.column(8), geometry),
  XSum.fromCells(10, graph.row(3), geometry),
  XSum.fromCells(10, graph.row(5), geometry),
  XSum.fromCells(20, graph.row(7), geometry),
  XSum.fromCells(23, graph.row(8), geometry),
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...xSums,
];
