// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hR_AJpwGwBA
// Source: https://cracking-the-cryptic.web.app/sudoku/mbpTBgtRmj

// Rules encoded here:
//  - Normal sudoku on the 9x9 grid (rows, columns and the standard 3x3 boxes,
//    which are the regions the source draws).
//  - Sandwich: a number outside a row or column is the sum of the digits
//    strictly between the 1 and the 9 in that row or column.
//
// Rule NOT encoded:
//  - The ant path. Ants travel from the green cell (R1C9) to the red cell
//    (R2C9): from the cell they are on they move that cell's digit in a
//    straight line, turn 90 degrees, move the new cell's digit, and so on;
//    the traced path may not cross itself. Nothing in this script constrains
//    that path, so the encoding is a relaxation of the published puzzle.

// Givens: the two cells carrying a printed digit in the source grid.
const givens = [
  new Given('R1C9', 2),
  new Given('R6C5', 6),
];

// Sandwich clues, transcribed from the numbers printed in the margin left of
// each row and above each column.
const rowSandwiches = [7, 5, 7, 22, 5, 30, 35, 0, 14];
const colSandwiches = [0, 18, 7, 13, 31, 3, 31, 2, 23];

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

return [
  new Shape('9x9'),
  ...givens,
  ...rowSandwiches.map(
    (v, i) => Sandwich.fromCells(v, graph.row(i + 1), geometry)),
  ...colSandwiches.map(
    (v, i) => Sandwich.fromCells(v, graph.column(i + 1), geometry)),
];
