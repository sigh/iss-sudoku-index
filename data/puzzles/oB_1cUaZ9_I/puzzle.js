// Title: Killer Sandwich Hard
// Author: Undar_Beyond
// Video: https://www.youtube.com/watch?v=oB_1cUaZ9_I
// Source: https://app.crackingthecryptic.com/webapp/GfFjhJ8n7H
//
// Normal sudoku rules apply (default 3x3 boxes). Each Cage below enforces its
// printed total with no repeated digit inside the cage (killer-cage
// semantics). Each Sandwich enforces the sum of the digits strictly between
// the 1 and the 9 in that row/column; only the six labelled lanes carry a
// clue, the rest are unconstrained.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cages, transcribed from the drawn cage totals and cells.
const cages = [
  new Cage(15, 'R2C1', 'R3C1', 'R4C1'),
  new Cage(14, 'R2C5', 'R3C5'),
  new Cage(15, 'R2C9', 'R3C9', 'R4C9'),
  new Cage(15, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(16, 'R5C6', 'R5C7', 'R6C6', 'R6C7'),
  new Cage(14, 'R6C9', 'R7C9'),
  new Cage(6, 'R8C4', 'R8C5', 'R8C6'),
  new Cage(11, 'R7C3', 'R8C3'),
  new Cage(13, 'R6C1', 'R7C1'),
];

// Sandwich (outside) clues, transcribed from the drawn margin totals. Only
// these six lanes carry a clue; the direction of the underlying line does not
// affect the sandwiched sum, so left-to-right / top-to-bottom is arbitrary.
const sandwiches = [
  Sandwich.fromCells(16, graph.row(1), geometry),
  Sandwich.fromCells(23, graph.row(3), geometry),
  Sandwich.fromCells(31, graph.row(5), geometry),
  Sandwich.fromCells(12, graph.row(7), geometry),
  Sandwich.fromCells(29, graph.row(9), geometry),
  Sandwich.fromCells(5, graph.column(3), geometry),
];

return [
  new Shape('9x9'),
  ...cages,
  ...sandwiches,
];
