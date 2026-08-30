// Title: Skyscraper Sudoku
// Author: Xevs
// Video: https://www.youtube.com/watch?v=rLlZA5ZND00
// Source: https://cracking-the-cryptic.web.app/sudoku/mMFtMNMMqg

// Normal sudoku rules apply. Digits represent skyscraper heights; each outside
// clue counts the skyscrapers visible from that vantage looking across the
// row/column, with taller ones hiding shorter ones behind them (ISS Skyscraper
// semantics, matching the rule: "a clue outside the grid shows how many can be
// seen in that row/column from that vantage point").
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const skyscrapers = [
  Skyscraper.fromCells(2, graph.row(2), geometry), // left of row 2
  Skyscraper.fromCells(4, graph.row(4), geometry), // left of row 4
  Skyscraper.fromCells(6, graph.row(6), geometry), // left of row 6
  Skyscraper.fromCells(8, graph.row(8), geometry), // left of row 8
  Skyscraper.fromCells(5, graph.column(5), geometry), // top of column 5
];

return [
  new Shape('9x9'),
  ...skyscrapers,
  new Given('R1C1', 1),
  new Given('R1C6', 2),
  new Given('R1C9', 8),
  new Given('R3C1', 3),
  new Given('R3C4', 6),
  new Given('R3C7', 4),
  new Given('R5C1', 5),
  new Given('R5C3', 2),
  new Given('R5C6', 3),
  new Given('R7C1', 7),
  new Given('R7C4', 8),
  new Given('R7C7', 2),
  new Given('R9C1', 9),
  new Given('R9C6', 4),
  new Given('R9C9', 6),
];
