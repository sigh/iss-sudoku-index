// Title: Between 1 and 9 (Sandwich) Sudoku
// Author: Isaac Resnikoff
// Video: https://www.youtube.com/watch?v=BnsD0-nBNlk
// Source: https://app.crackingthecryptic.com/HNjjfnrTfm

// Normal sudoku rules apply. Each outside clue gives the sum of the digits
// strictly between the 1 and the 9 in that row/column -> Sandwich, one per
// row and one per column. Sandwich's cell list is order-independent, so
// which side of the grid the clue is drawn on does not change the encoding.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Row clues, drawn left of R1..R9 (overlays #9-#17 in the payload).
const rowClues = [5, 13, 20, 9, 12, 0, 4, 14, 5];
// Column clues, drawn above C1..C9 (overlays #0-#8 in the payload).
const columnClues = [19, 7, 15, 19, 4, 0, 6, 9, 35];

const rowSandwiches = rowClues.map((total, r) =>
  Sandwich.fromCells(total, graph.row(r + 1), geometry));
const columnSandwiches = columnClues.map((total, c) =>
  Sandwich.fromCells(total, graph.column(c + 1), geometry));

return [
  new Shape('9x9'),

  new Given('R1C9', 1),
  new Given('R5C5', 1),

  ...rowSandwiches,
  ...columnSandwiches,
];
