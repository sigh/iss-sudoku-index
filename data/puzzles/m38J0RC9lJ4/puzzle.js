// Title: Twenty Six
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=m38J0RC9lJ4
// Source: https://sudokupad.app/zvfum6weab

// Normal sudoku rules apply.
// Skyscrapers: digits in the grid are skyscraper heights; each outside clue
//   gives the number of skyscrapers visible looking into that row/column
//   from the clue's side (taller skyscrapers hide shorter ones behind them).
// The cell with a gray circle (R5C5) contains an odd digit.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C3', 2),
  new Given('R1C4', 6),
  new Given('R2C7', 2),
  new Given('R3C7', 6),
  new Given('R4C6', 2),
  new Given('R5C6', 6),
  new Given('R6C1', 2),
  new Given('R7C1', 6),

  // Gray circle: R5C5 is odd.
  new Given('R5C5', 1, 3, 5, 7, 9),

  // Skyscraper outside clues. graph.column()/graph.row() run top-to-bottom
  // and left-to-right respectively, so a clue viewed from the far side uses
  // the reversed order (Skyscraper is directional: first cell is nearest
  // the clue).
  Skyscraper.fromCells(2, graph.column(2), geometry), // top of column 2
  Skyscraper.fromCells(6, graph.column(3), geometry), // top of column 3
  Skyscraper.fromCells(2, graph.column(7), geometry), // top of column 7
  Skyscraper.fromCells(6, graph.column(8), geometry), // top of column 8

  Skyscraper.fromCells(2, graph.column(3).reverse(), geometry), // bottom of column 3
  Skyscraper.fromCells(6, graph.column(4).reverse(), geometry), // bottom of column 4
  Skyscraper.fromCells(2, graph.column(6).reverse(), geometry), // bottom of column 6
  Skyscraper.fromCells(6, graph.column(7).reverse(), geometry), // bottom of column 7

  Skyscraper.fromCells(2, graph.row(5), geometry), // left of row 5
  Skyscraper.fromCells(6, graph.row(6), geometry), // left of row 6
  Skyscraper.fromCells(2, graph.row(8), geometry), // left of row 8
  Skyscraper.fromCells(6, graph.row(9), geometry), // left of row 9

  Skyscraper.fromCells(2, graph.row(2).reverse(), geometry), // right of row 2
  Skyscraper.fromCells(6, graph.row(3).reverse(), geometry), // right of row 3
];
