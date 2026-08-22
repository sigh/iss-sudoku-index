// Title: Smorgasbord
// Author: Qodec
// Video: https://www.youtube.com/watch?v=ZnjGEa1RnAE
// Source: https://app.crackingthecryptic.com/sudoku/rDpM7bngfd

// Normal sudoku rules apply (default row/column/box constraints from
// Shape('9x9')). Outside digits are standard Sandwich clues: the sum of the
// digits between the 1 and the 9 in that row/column. Only 8 of the 18 lanes
// carry a clue; row/column indices and values below are transcribed from the
// puzzle's overlay centers via the geometry helper's "outside clue lane"
// output. The reading direction along each lane is not a rule fact (the
// sandwiched sum is the same either way), so cells are listed low-to-high.
const geometry = cellGeometry('9x9');
const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));
const col = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => makeCellId(r, c));

const sandwiches = [
  Sandwich.fromCells(27, row(3), geometry),
  Sandwich.fromCells(0, row(4), geometry),
  Sandwich.fromCells(0, row(6), geometry),
  Sandwich.fromCells(28, row(7), geometry),
  Sandwich.fromCells(16, col(2), geometry),
  Sandwich.fromCells(2, col(4), geometry),
  Sandwich.fromCells(18, col(6), geometry),
  Sandwich.fromCells(21, col(8), geometry),
];

// Circles drawn on the corner shared by four cells: every digit printed in
// the circle must appear at least once among those four cells. Cell groups
// and digits transcribed from the puzzle's overlay `center`/`text` fields
// via the geometry helper's corner(...) reading. Quad(topLeftCell, ...values)
// anchors at the top-left cell of the 2x2 square.
const circles = [
  new Quad('R1C1', 4, 5),
  new Quad('R1C6', 6),
  new Quad('R3C6', 1, 2, 3),
  new Quad('R6C3', 1, 3, 4),
  new Quad('R8C3', 3),
  new Quad('R8C8', 7, 8),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...circles,
];
