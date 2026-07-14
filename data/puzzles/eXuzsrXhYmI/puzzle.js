// Title: The Knight's Last Meal
// Author: Dook
// Video: https://www.youtube.com/watch?v=eXuzsrXhYmI
// Source: https://sudokupad.app/8ebxp1fhz8

// Normal sudoku rules apply.
//
// "In cages, digits must sum to the same number, which has to be deduced.
// Digits cannot repeat in a cage." -- the puzzle draws 6 cages with no
// printed totals. Each cage is distinct-digits (AllDifferent), and all 6
// cages share one common, unknown total: EqualSum ties their sums together
// without fixing the value, so the solver deduces it rather than being told
// it (it happens to be 13, but that number is not given in the rules and
// must not be hard-coded as a Cage total).
const cages = [
  ['R1C2', 'R2C2', 'R3C2', 'R4C2'],
  ['R4C1', 'R5C1', 'R6C1'],
  ['R5C3', 'R6C3'],
  ['R8C3', 'R8C4', 'R9C4'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7'],
  ['R3C8', 'R4C8'],
];

// "Cells separated by a knight's move in chess can't have the same digit."
const antiknight = new AntiKnight();

// "Clues outside the grid show the sum of the digits sandwiched between the
// 1 and the 9 in that row/column." -- Sandwich matches this literally (it
// reads the digits 1 and 9 specifically, not the row/column min and max).
// Build each from its full row/column of cells so the canonical arrowId
// comes from the geometry rather than being hand-typed.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const sandwiches = [
  Sandwich.fromCells(0, graph.column(1), geometry),
  Sandwich.fromCells(5, graph.column(2), geometry),
  Sandwich.fromCells(0, graph.column(5), geometry),
  Sandwich.fromCells(27, graph.column(7), geometry),
  Sandwich.fromCells(11, graph.row(2), geometry),
  Sandwich.fromCells(7, graph.row(5), geometry),
  Sandwich.fromCells(0, graph.row(8), geometry),
];

return [
  new Shape('9x9'),

  new Given('R2C5', 7),
  new Given('R3C2', 4),
  new Given('R7C3', 9),

  antiknight,

  ...cages.map(cells => new AllDifferent(...cells)),
  new EqualSum(...cages),

  ...sandwiches,
];
