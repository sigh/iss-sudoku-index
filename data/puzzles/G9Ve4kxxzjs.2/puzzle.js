// Title: May 8, 2022: B1G3 Sandwich
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=G9Ve4kxxzjs
// Source: https://tinyurl.com/44rrs6e5

// Normal sudoku rules apply (default 6x6 boxes: 2 rows x 3 columns). Each
// outside-grid clue gives the sum of the digits between the 1 and the 6 in
// that row/column, not including the 1 and 6 themselves (Sandwich). Sandwich
// is non-directional, so the side a clue is drawn on does not matter -- only
// which row/column it labels.

const graph = cellGraph('6x6');
const geometry = cellGeometry('6x6');

// Outside clues are drawn as raw text labels, not a native sandwichsum array.
// Payload text cells: R3C0=3, R4C7=3, R0C4=5, R7C3=6. For a 6x6 grid the
// margin index is 0 (left/top) or 7 (right/bottom); the other index is the
// 1-indexed row/column directly (see EPixkKjLj4A, DBOFq2sWdPI for the same
// convention confirmed on other archived puzzles).
const sandwichClues = [
  Sandwich.fromCells(3, graph.row(3), geometry), // R3C0
  Sandwich.fromCells(3, graph.row(4), geometry), // R4C7
  Sandwich.fromCells(5, graph.column(4), geometry), // R0C4
  Sandwich.fromCells(6, graph.column(3), geometry), // R7C3
];

return [
  new Shape('6x6'),
  new Given('R1C1', 4),
  new Given('R3C6', 6),
  new Given('R4C1', 6),
  new Given('R4C4', 5),
  new Given('R6C6', 5),
  ...sandwichClues,
];
