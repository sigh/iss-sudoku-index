// Title: Think Outside the Box
// Author: Frippe
// Video: https://www.youtube.com/watch?v=L7JlTO588xM
// Source: https://sudokupad.app/kjlvev0m76

// The puzzle is drawn on a 15x15 canvas; a plain 9x9 sudoku grid sits
// somewhere inside it, boxed off by the drawn 3x3-box divider lines (the
// surrounding margin cells show no box divisions, only the 9x9 area does).
// This script models that 9x9 sub-grid directly as the whole playing field.
// Normal sudoku rules apply: 1-9 once each in every row, column, and box.
//
// The grid also obeys a row-indexing rule: for every cell R{X}C{c} with
// value V, cell R{V}C{c} holds X (the rules give a worked example: r3c6=8
// means r8c6=3).
//
// Omitted: three sum cages (totals 24, 45, 45) and three bent arrows drawn
// near R3-5,C3-5 of the true grid. Only fragments of each cage's boundary
// are drawn (no cage closes within the available geometry, and the arrows
// carry no visible circle/sum value), so neither is encoded here.

const graph = cellGraph('9x9');

return [
  new Shape('9x9'),
  new Indexing('R', ...graph.cells()),
];
