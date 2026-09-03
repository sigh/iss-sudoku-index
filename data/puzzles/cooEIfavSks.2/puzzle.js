// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=cooEIfavSks
// Source: https://tinyurl.com/y7wcqvqq

// The puzzle is published with no rules text; the video description calls it an
// Arrow Sandwich Sudoku. The clue meanings below are read off the drawing.
//
// Encoded:
//
// - Normal Sudoku, standard 3x3 boxes, two given digits.
// - Sandwich: a number printed outside the grid gives the sum of the digits
//   strictly between the 1 and the 9 of the row or column it labels. Six such
//   numbers stand alone in the margin; four more sit at the tail of an arrow
//   that runs into the grid.
// - Arrow: the digits along a shaft sum to the digit in its bulb cell. Three
//   arrows have their bulb on a grid cell.
//
// The four numbers at an arrow tail are read as sandwich totals and not as
// shaft sums, because no sum reading survives the arithmetic: the tail above
// column 5 carries 21 while its arrow covers only R1C4 and R2C4, two cells of
// one column and so at most 9 + 8 = 17; continuing that shaft to the grid edge
// instead makes it the whole of column 4, a constant 45, which also kills the
// 12 at the tail beside row 1. All four are drawn alike, so one refutation
// settles the type.
//
// A number printed on the left edge labels a row and one on the top edge labels
// a column, so for each of the four the candidate lanes are the lane it is
// printed beside and the lane its arrow runs into. Those coincide for the 12
// (row 1) and for the 23 (column 3); the other two are encoded as disjunctions
// over their two candidate lanes.
//
// Not encoded:
//
// - Whatever the six arrows entering the grid from the margin restrict beyond
//   naming the lane their number labels -- including the two whose tail carries
//   no number at all, above column 6 (covering R1C6-R2C6) and above column 9
//   (covering R1C9-R2C9), which give no total for any lane.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const rowSandwich =
  (row, total) => Sandwich.fromCells(total, graph.row(row), geometry);
const colSandwich =
  (col, total) => Sandwich.fromCells(total, graph.column(col), geometry);

// Totals transcribed from the numbers drawn in the margin, as [lane, total].
// Standing alone, beside their row or above their column.
const plainRowTotals = [[2, 23], [6, 0], [7, 3], [9, 0]];
const plainColTotals = [[2, 0], [8, 0]];

// Arrows drawn with their bulb circle on a grid cell, bulb first.
const arrows = [
  ['R9C1', 'R9C2', 'R9C3'],
  ['R7C9', 'R8C9', 'R8C8'],
  ['R6C6', 'R7C6', 'R8C6', 'R8C5'],
];

return [
  new Shape('9x9'),

  new Given('R7C7', 8),
  new Given('R8C1', 4),

  ...plainRowTotals.map(([row, total]) => rowSandwich(row, total)),
  ...plainColTotals.map(([col, total]) => colSandwich(col, total)),

  // At an arrow tail, with both candidate lanes the same: the 12 is printed
  // beside row 1 and its arrow runs along row 1 (R1C1-R1C2); the 23 is printed
  // above column 3 and its arrow runs down column 3 (R1C3 to R5C3, then one
  // step left to R5C2).
  rowSandwich(1, 12),
  colSandwich(3, 23),

  // The 21 is printed above column 5, but its arrow travels one cell left
  // through the margin before turning down into column 4 (R1C4-R2C4).
  new Or([colSandwich(4, 21), colSandwich(5, 21)]),

  // The 32 is printed beside row 4, but its arrow leaves the margin diagonally
  // and enters the grid at R5C1 (then R6C2, R7C3, R7C4).
  new Or([rowSandwich(4, 32), rowSandwich(5, 32)]),

  ...arrows.map(cells => new Arrow(...cells)),
];
