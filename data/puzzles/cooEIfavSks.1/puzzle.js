// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=cooEIfavSks
// Source: https://cracking-the-cryptic.web.app/sudoku/TdnQtbGqqL

// The puzzle is published with no written rules; the clue meanings below are
// read off the drawing. Encoded here:
//
// - Normal Sudoku, standard 3x3 boxes, two given digits.
// - Sandwich: a number outside the grid gives the sum of the digits strictly
//   between the 1 and the 9 of the row or column it labels.
// - Arrow: the digits along a shaft sum to the digit in the bulb cell.
//
// Four of the numbers outside the grid sit in circles at the tail of an arrow
// running into the grid. They are read as sandwich totals rather than as shaft
// sums, because no sum reading survives the arithmetic: the circle carrying 21
// has an arrow covering only R1C4 and R2C4, two cells of one column and so at
// most 9 + 8 = 17, and continuing that shaft to the grid edge instead makes it
// the whole of column 4, a constant 45.
//
// Not encoded:
//
// - The circled 23 above C3 and the circled 32 beside R4. The arrow attached
//   to each bends out of a single row or column part-way along -- down C3 then
//   left along R5, and down the R5C1-R6C2-R7C3 diagonal then right along R7 --
//   so the line each total labels could be the circle's own lane or the bent
//   path, and nothing drawn chooses between them.
// - The two empty circles outside the grid, above C6 and above C9: they carry
//   no number, so no total is given for their lines.
// - Whatever the six arrows entering the grid from the margin restrict beyond
//   naming the line their circle's total labels.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Totals transcribed from the numbers drawn outside the grid. Row 1 carries
// the circled 12, whose circle is drawn beside row 1 and whose arrow runs
// along row 1, so both candidate lines for it are row 1; the rest are printed
// plainly beside the row or column they label.
const rowTotals = [[1, 12], [2, 23], [6, 0], [7, 3], [9, 0]];
const colTotals = [[2, 0], [8, 0]];

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

  ...rowTotals.map(
    ([row, total]) => Sandwich.fromCells(total, graph.row(row), geometry)),
  ...colTotals.map(
    ([col, total]) => Sandwich.fromCells(total, graph.column(col), geometry)),

  // The circled 21 is centred above C5, while its arrow travels left through
  // the margin and then down column 4: the total labels one of those two
  // columns, and the drawing does not say which.
  new Or([
    Sandwich.fromCells(21, graph.column(4), geometry),
    Sandwich.fromCells(21, graph.column(5), geometry),
  ]),

  ...arrows.map(cells => new Arrow(...cells)),
];
