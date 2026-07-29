// Title: 13
// Author: Sudoku Noob
// Video: https://www.youtube.com/watch?v=QvtYrZfHa2c
// Source: https://sudokupad.app/LnNgNPRpDL

// Normal 9x9 Sudoku; both drawn diagonals have distinct digits. Every drawn cage
// has distinct digits, with a total where shown. X-marked adjacent pairs total 10.
// The outside clues are sandwich sums between 1 and 9; the bottom C7 clue is the
// same symmetric column constraint as a top clue.

// Givens and cage cell lists are transcribed from the source grid and cage outlines.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

return [
  new Shape('9x9'),
  new Given('R4C1', 8),
  new Given('R6C9', 9),

  new Diagonal(1),
  new Diagonal(-1),

  new Cage(17, 'R1C5', 'R2C5'),
  new Cage(4, 'R8C5', 'R9C5'),
  new AllDifferent('R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R6C1'),
  new Cage(34, 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9', 'R5C9'),
  new AllDifferent('R1C8', 'R2C8', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R4C3', 'R4C4'),
  new AllDifferent('R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6', 'R6C7', 'R7C2', 'R8C2'),
  new Cage(17, 'R8C4', 'R9C4'),
  new Cage(4, 'R2C2', 'R3C2'),
  new Cage(4, 'R1C6', 'R2C6'),
  new Cage(11, 'R8C7', 'R8C8'),

  new X('R5C2', 'R6C2'),
  new X('R6C3', 'R7C3'),
  new X('R3C4', 'R4C4'),

  // Derive the row and column paths so Sandwich selects its canonical clue ids.
  Sandwich.fromCells(26, graph.row(8), geometry),
  Sandwich.fromCells(6, graph.column(7), geometry),
];
