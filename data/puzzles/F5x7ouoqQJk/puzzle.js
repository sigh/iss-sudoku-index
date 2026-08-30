// Title: Sandwich Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=F5x7ouoqQJk
// Source: https://cracking-the-cryptic.web.app/sudoku/fRjmFrGdjR

// Normal Sudoku rules apply (rows, columns and boxes). Every outside clue is
// a Sandwich sum: the sum of the digits sandwiched between the 1 and the 9
// in that row or column. The raw payload carries no rules text; the video
// title ("The Key To Sandwich Sudoku") plus the outside overlays being
// restricted to only the top and left of the grid -- exactly the class's own
// placement rule -- identify the puzzle type. The scattered grey cell
// shading in the payload is decorative (no rule text or other geometry gives
// it meaning) and is not encoded.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const givens = [
  new Given('R1C8', 9),
  new Given('R2C1', 5),
  new Given('R2C5', 8),
  new Given('R2C7', 4),
  new Given('R7C2', 4),
  new Given('R9C4', 1),
  new Given('R9C7', 6),
];

// Sandwich clues, from the outside-clue overlays (row/column, printed sum).
const sandwiches = [
  Sandwich.fromCells(28, graph.row(4), geometry),
  Sandwich.fromCells(0, graph.row(6), geometry),
  Sandwich.fromCells(0, graph.row(7), geometry),
  Sandwich.fromCells(10, graph.row(9), geometry),
  Sandwich.fromCells(16, graph.column(1), geometry),
  Sandwich.fromCells(27, graph.column(4), geometry),
  Sandwich.fromCells(7, graph.column(5), geometry),
];

return [
  new Shape('9x9'),
  ...givens,
  ...sandwiches,
];
