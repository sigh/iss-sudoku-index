// Title: September 2, 2021: Sandwich
// Author: Setter 2
// Video: https://www.youtube.com/watch?v=z-CQLijElrk
// Source: https://tinyurl.com/yfatnaye

// Normal 6x6 sudoku (rows/columns/2x3 boxes). One given: R1C1=1.
// Outside clues give the sum of digits sandwiched between the 1 and the 6 in
// that row/column -> Sandwich (its class doc generalizes "1 and the 9" to the
// grid's own min/max, which is 1 and 6 here). Payload `sandwichsum` cell ids
// use R#C0 for a row clue and R0C# for a column clue, with # the 1-indexed
// row/column directly (per describe-json-puzzle's f-puzzles schema note).
// Rows/columns 1, 3, 5 carry no outside clue and so no Sandwich constraint.

const geometry = cellGeometry('6x6');
const graph = cellGraph('6x6');

return [
  new Shape('6x6'),

  new Given('R1C1', 1),

  Sandwich.fromCells(10, graph.row(2), geometry),
  Sandwich.fromCells(11, graph.row(4), geometry),
  Sandwich.fromCells(12, graph.row(6), geometry),

  Sandwich.fromCells(12, graph.column(2), geometry),
  Sandwich.fromCells(11, graph.column(4), geometry),
  Sandwich.fromCells(10, graph.column(6), geometry),
];
