// Title: Skyscraper Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=2i4l7DtQFws
// Source: https://app.crackingthecryptic.com/sudoku/mt2NhLT7g3

// Normal sudoku rules apply. Digits represent skyscraper heights; each outside
// clue counts the skyscrapers visible from that vantage looking across the
// row/column, with taller ones hiding shorter ones behind them (ISS Skyscraper
// semantics, matching the rule: "a clue outside the grid shows how many can be
// seen in that row/column from that vantage point").
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const skyscrapers = [
  Skyscraper.fromCells(5, graph.column(5), geometry), // top of column 5
  Skyscraper.fromCells(5, graph.column(5).slice().reverse(), geometry), // bottom of column 5
  Skyscraper.fromCells(6, graph.column(8), geometry), // top of column 8
  Skyscraper.fromCells(4, graph.row(2), geometry), // left of row 2
  Skyscraper.fromCells(5, graph.row(2).slice().reverse(), geometry), // right of row 2
  Skyscraper.fromCells(2, graph.row(5), geometry), // left of row 5
  Skyscraper.fromCells(2, graph.row(5).slice().reverse(), geometry), // right of row 5
  Skyscraper.fromCells(3, graph.row(8).slice().reverse(), geometry), // right of row 8
];

return [
  new Shape('9x9'),
  ...skyscrapers,
  new Given('R1C4', 1),
  new Given('R1C6', 2),
  new Given('R3C4', 3),
  new Given('R3C6', 4),
  new Given('R4C1', 9),
  new Given('R4C3', 7),
  new Given('R4C7', 3),
  new Given('R4C9', 4),
  new Given('R6C1', 8),
  new Given('R6C3', 6),
  new Given('R6C7', 2),
  new Given('R6C9', 1),
  new Given('R7C4', 6),
  new Given('R7C6', 7),
  new Given('R9C4', 8),
  new Given('R9C6', 9),
];
