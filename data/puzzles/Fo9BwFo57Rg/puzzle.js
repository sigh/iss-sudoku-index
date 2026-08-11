// Title: Horcrux
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=Fo9BwFo57Rg
// Source: https://app.crackingthecryptic.com/sudoku/2M8Hmp6rdR

// Normal sudoku rules apply (standard 3x3 boxes, no givens).
// Outside clues: the sum of the digits strictly between the 1 and the 9 in
// that row/column -> Sandwich.fromCells(total, cells, geometry).
// Purple lines: a set of consecutive digits in any order, without repeats
// -> Renban(...cells). L1 and L3 are 3-cell bent (V-shaped) lines; each is
// one continuous clue, taken in drawn order.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Row/column outside sandwich totals, transcribed from the drawn outside
// clue markers (left lane = row sandwich, top lane = column sandwich).
const sandwiches = [
  Sandwich.fromCells(8, graph.row(1), geometry),
  Sandwich.fromCells(9, graph.row(4), geometry),
  Sandwich.fromCells(9, graph.row(5), geometry),
  Sandwich.fromCells(9, graph.row(6), geometry),
  Sandwich.fromCells(10, graph.row(9), geometry),
  Sandwich.fromCells(22, graph.column(3), geometry),
  Sandwich.fromCells(9, graph.column(5), geometry),
  Sandwich.fromCells(22, graph.column(7), geometry),
];

// Purple (Renban) line cell paths, transcribed from the drawn line vertices.
const renbanLines = [
  new Renban('R1C3', 'R2C2'),
  new Renban('R4C4', 'R3C5', 'R4C6'),
  new Renban('R5C2', 'R6C3'),
  new Renban('R7C4', 'R8C5', 'R7C6'),
  new Renban('R8C3', 'R9C4'),
  new Renban('R9C6', 'R8C7'),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...renbanLines,
];
