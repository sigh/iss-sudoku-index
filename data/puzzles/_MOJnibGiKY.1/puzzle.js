// Title: September 25, 2021: Full Rank
// Author: clover!
// Video: https://www.youtube.com/watch?v=_MOJnibGiKY
// Source: https://tinyurl.com/323cb5j6

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
//
// Read every row and every column in both directions as a 9-digit number:
// nine rows left-to-right, nine rows right-to-left, nine columns
// top-to-bottom, nine columns bottom-to-top -- 36 numbers in total. Sort
// them from smallest (rank 1) to largest (rank 36). Each outside clue gives
// the rank of the row/column read from that clue's side, in the direction
// the rules' worked examples establish: a clue above a column reads that
// column top-to-bottom, and a clue to the right of a row reads that row
// right-to-left. By symmetry a clue left of a row reads left-to-right, and
// a clue below a column reads bottom-to-top.
//
// This maps directly onto ISS's native FullRank outside-clue class, which
// implements exactly this whole-grid ranking. Each clue is built with
// `FullRank.fromCells(rank, cells, geometry)` from the actual row/column
// cell list in the intended reading direction, so the direction comes from
// the cells rather than a hand-written arrow id. Ties are left at the
// default (ties allowed only among unclued rows/columns; no two clued
// ranks may tie, which FullRank enforces itself), since the rules never
// address tie-breaking among unclued numbers.

const shape = '9x9';
const graph = cellGraph(shape);
const geometry = cellGeometry(shape);

return [
  new Shape(shape),

  // Givens (14 clues).
  new Given('R1C3', 8),
  new Given('R1C5', 7),
  new Given('R2C6', 4),
  new Given('R3C1', 3),
  new Given('R5C1', 4),
  new Given('R5C8', 5),
  new Given('R6C2', 1),
  new Given('R6C7', 7),
  new Given('R6C9', 3),
  new Given('R7C6', 6),
  new Given('R8C5', 1),
  new Given('R8C9', 2),
  new Given('R9C6', 8),
  new Given('R9C8', 9),

  // Full-rank outside clues (text-element positions R{0,10}C{1..9} are
  // column clues above/below, R{1..9}C{0,10} are row clues left/right).
  FullRank.fromCells(1, graph.row(1), geometry),                         // left of row 1 -> row 1 left-to-right
  FullRank.fromCells(35, graph.row(2), geometry),                        // left of row 2 -> row 2 left-to-right
  FullRank.fromCells(32, graph.row(4), geometry),                        // left of row 4 -> row 4 left-to-right
  FullRank.fromCells(8, graph.row(7), geometry),                         // left of row 7 -> row 7 left-to-right
  FullRank.fromCells(36, graph.row(5).slice().reverse(), geometry),      // right of row 5 -> row 5 right-to-left
  FullRank.fromCells(30, graph.row(7).slice().reverse(), geometry),      // right of row 7 -> row 7 right-to-left
  FullRank.fromCells(6, graph.row(8).slice().reverse(), geometry),       // right of row 8 -> row 8 right-to-left
  FullRank.fromCells(3, graph.row(9).slice().reverse(), geometry),       // right of row 9 -> row 9 right-to-left
  FullRank.fromCells(4, graph.column(1), geometry),                      // above col 1 -> col 1 top-to-bottom
  FullRank.fromCells(7, graph.column(2), geometry),                      // above col 2 -> col 2 top-to-bottom
  FullRank.fromCells(29, graph.column(3), geometry),                     // above col 3 -> col 3 top-to-bottom
  FullRank.fromCells(33, graph.column(7), geometry),                     // above col 7 -> col 7 top-to-bottom
  FullRank.fromCells(5, graph.column(5).slice().reverse(), geometry),    // below col 5 -> col 5 bottom-to-top
  FullRank.fromCells(31, graph.column(6).slice().reverse(), geometry),   // below col 6 -> col 6 bottom-to-top
  FullRank.fromCells(34, graph.column(8).slice().reverse(), geometry),   // below col 8 -> col 8 bottom-to-top
  FullRank.fromCells(2, graph.column(9).slice().reverse(), geometry),    // below col 9 -> col 9 bottom-to-top
];
