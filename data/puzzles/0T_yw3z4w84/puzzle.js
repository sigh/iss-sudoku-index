// Title: Who Killed my Sandwich????
// Author: Enje
// Video: https://www.youtube.com/watch?v=0T_yw3z4w84
// Source: https://app.crackingthecryptic.com/sudoku/P2MgjGj6JF

// Normal sudoku rules apply (default row/column/box all-different on the 9x9
// grid). Each outside clue gives the sandwich sum between the 1 and the 9 in
// its row/column. Cages show their totals with no repeats within a cage.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const sandwiches = [
  Sandwich.fromCells(0, graph.row(1), geometry),
  Sandwich.fromCells(8, graph.row(4), geometry),
  Sandwich.fromCells(17, graph.row(5), geometry),
  Sandwich.fromCells(33, graph.column(1), geometry),
  Sandwich.fromCells(32, graph.column(2), geometry),
  Sandwich.fromCells(6, graph.column(4), geometry),
  Sandwich.fromCells(21, graph.column(5), geometry),
  Sandwich.fromCells(8, graph.column(6), geometry),
  Sandwich.fromCells(32, graph.column(8), geometry),
  Sandwich.fromCells(33, graph.column(9), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,

  // Cages.
  new Cage(11, 'R1C3', 'R1C4'),
  new Cage(9, 'R2C7', 'R2C8'),
  new Cage(15, 'R4C8', 'R5C8', 'R5C7'),
  new Cage(6, 'R6C8', 'R6C9'),
  new Cage(10, 'R8C8', 'R8C9'),
  new Cage(10, 'R9C8', 'R9C9'),
  new Cage(13, 'R8C6', 'R9C6'),
  new Cage(21, 'R7C3', 'R8C3', 'R9C3'),
  new Cage(14, 'R6C2', 'R7C2', 'R8C2'),
  new Cage(7, 'R4C2', 'R4C1'),
];
