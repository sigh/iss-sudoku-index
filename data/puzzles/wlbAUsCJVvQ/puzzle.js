// Title: Christmas Tree: A Sandwich Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wlbAUsCJVvQ
// Source: https://cracking-the-cryptic.web.app/sudoku/9N3bbhLff9

// No published rules text survives for this puzzle. Encoded from drawn
// structure only: standard sudoku, no givens, killer cages (distinct
// digits, sum to the printed total), and Sandwich clues (sum of the digits
// strictly between the 1 and the 9 in that row or column) -- every
// outside-clue overlay sits centred on a row/column edge, not offset toward
// a corner, so all twelve are straight-line Sandwich reads rather than
// little-killer diagonals. Grey/purple/orange/gold cell shading forms a
// decorative Christmas-tree picture with no rule text attached to it, so it
// is omitted.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Killer cages: cells and totals from the drawn cage outlines.
const cages = [
  new Cage(33, 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'),
  new Cage(24, 'R1C3', 'R1C2', 'R2C2', 'R3C2', 'R4C2'),
  new Cage(16, 'R3C3', 'R2C3', 'R2C4'),
  new Cage(26, 'R1C4', 'R1C5', 'R1C6', 'R2C5'),
  new Cage(6, 'R2C6', 'R2C7', 'R3C7'),
  new Cage(22, 'R1C7', 'R1C8', 'R2C8', 'R3C8', 'R4C8'),
  new Cage(24, 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Cage(8, 'R6C1', 'R6C2'),
  new Cage(13, 'R7C1', 'R7C2'),
  new Cage(3, 'R8C1', 'R9C1'),
  new Cage(8, 'R9C2', 'R9C3'),
  new Cage(13, 'R8C2', 'R8C3'),
  new Cage(28, 'R7C3', 'R7C4', 'R8C4', 'R9C4'),
  new Cage(12, 'R6C3', 'R6C4', 'R5C4'),
  new Cage(15, 'R5C6', 'R6C6', 'R6C7'),
  new Cage(15, 'R6C8', 'R6C9'),
  new Cage(20, 'R7C7', 'R7C6', 'R8C6', 'R9C6'),
  new Cage(9, 'R7C8', 'R7C9'),
  new Cage(16, 'R8C7', 'R9C7'),
  new Cage(13, 'R8C8', 'R9C8'),
  new Cage(6, 'R8C9', 'R9C9'),
  new Cage(22, 'R3C5', 'R4C5', 'R5C5', 'R6C5'),
];

// Sandwich clues: outside-clue text, mapped to the row/column each is
// centred against.
const sandwiches = [
  Sandwich.fromCells(17, graph.column(1), geometry),
  Sandwich.fromCells(23, graph.column(2), geometry),
  Sandwich.fromCells(22, graph.column(4), geometry),
  Sandwich.fromCells(35, graph.column(5), geometry),
  Sandwich.fromCells(7, graph.column(6), geometry),
  Sandwich.fromCells(0, graph.column(8), geometry),
  Sandwich.fromCells(0, graph.column(9), geometry),
  Sandwich.fromCells(7, graph.row(1), geometry),
  Sandwich.fromCells(3, graph.row(2), geometry),
  Sandwich.fromCells(12, graph.row(5), geometry),
  Sandwich.fromCells(28, graph.row(8), geometry),
  Sandwich.fromCells(0, graph.row(9), geometry),
];

return [
  new Shape('9x9'),

  ...cages,
  ...sandwiches,
];
