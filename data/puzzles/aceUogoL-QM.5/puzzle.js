// Title: Skyscrapers Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=aceUogoL-QM
// Source: https://tinyurl.com/ycxnmakh

// Normal sudoku rules apply.
// Skyscrapers: digits in the grid are skyscraper heights; each outside clue
//   gives the number of skyscrapers visible looking into that row/column
//   from the clue's side (taller skyscrapers hide shorter ones behind them).
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Givens.
  new Given('R3C4', 2),
  new Given('R3C6', 3),
  new Given('R4C3', 1),
  new Given('R4C7', 4),
  new Given('R5C5', 9),
  new Given('R6C3', 8),
  new Given('R6C7', 5),
  new Given('R7C4', 7),
  new Given('R7C6', 6),

  // Skyscraper outside clues. graph.column()/graph.row() run top-to-bottom
  // and left-to-right respectively, so a clue viewed from the far side uses
  // the reversed order (Skyscraper is directional: first cell is nearest
  // the clue).
  Skyscraper.fromCells(5, graph.column(5), geometry), // top of column 5
  Skyscraper.fromCells(5, graph.column(7), geometry), // top of column 7

  Skyscraper.fromCells(3, graph.column(3).reverse(), geometry), // bottom of column 3
  Skyscraper.fromCells(5, graph.column(5).reverse(), geometry), // bottom of column 5

  Skyscraper.fromCells(7, graph.row(3), geometry), // left of row 3
  Skyscraper.fromCells(4, graph.row(6), geometry), // left of row 6
  Skyscraper.fromCells(4, graph.row(9), geometry), // left of row 9

  Skyscraper.fromCells(3, graph.row(1).reverse(), geometry), // right of row 1
  Skyscraper.fromCells(6, graph.row(4).reverse(), geometry), // right of row 4
  Skyscraper.fromCells(7, graph.row(7).reverse(), geometry), // right of row 7
];
