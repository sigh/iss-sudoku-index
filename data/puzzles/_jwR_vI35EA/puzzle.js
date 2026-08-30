// Title: The Sudoku Of Oz
// Author: Unknown
// Video: https://www.youtube.com/watch?v=_jwR_vI35EA
// Source: https://cracking-the-cryptic.web.app/sudoku/HnhHFDgJBf

// Normal Sudoku rules apply. The four outside numbers are Sandwich sums
// (total of the digits strictly between 1 and 9 in that row/column) -- the
// only outside-clue family consistent with all four printed values (0 and 2
// rule out Little Killer and X-Sum; 12 and 29 rule out Skyscraper).
// The six light-grey lines each ending in one bulb are omitted: the source
// payload carries no rules text at all, and their rule cannot be recovered
// from the drawing alone. They look like thermometers (bulb-marked, plain
// grey), but a literal Thermo reading is disproved: one line is 16 cells
// (more than the 9 available digits), and a second line's fixed
// bulb-first-increasing direction has no completion together with the
// Sandwich reading of the row-5 outside clue.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const sandwiches = [
  Sandwich.fromCells(12, graph.column(2), geometry),
  Sandwich.fromCells(29, graph.column(5), geometry),
  Sandwich.fromCells(0, graph.row(2), geometry),
  Sandwich.fromCells(2, graph.row(5), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,
];
