// Title: Tuning the Thermostat
// Author: FullDeck and Missing a Few Cards
// Video: https://www.youtube.com/watch?v=UX5P08kLwTE
// Source: https://sudokupad.app/ef10mw7nxl

// Normal sudoku rules apply.
// Thermometers: digits strictly increase from the bulb (first cell) to the
//   tip (last cell).
// Skyscrapers: an outside clue gives the number of skyscrapers (digit
//   heights) visible looking into that column from the clue's side; taller
//   skyscrapers hide shorter ones behind them.
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

const thermos = [
  ['R3C2', 'R4C3', 'R5C3'],
  ['R7C8', 'R6C9', 'R5C9'],
  ['R1C5', 'R2C6', 'R3C6'],
  ['R9C5', 'R8C4', 'R7C4'],
  ['R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C1'],
  ['R1C5', 'R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R9C5', 'R8C6', 'R7C6', 'R6C6', 'R5C6'],
  ['R7C8', 'R6C7', 'R5C7', 'R4C7', 'R3C7'],
  ['R7C3', 'R8C3', 'R9C2', 'R9C1'],
  ['R1C7', 'R1C8', 'R2C9', 'R3C9'],
  ['R6C4', 'R5C5', 'R4C6'],
];

return [
  new Shape('9x9'),

  // Given (single clue digit).
  new Given('R9C6', 1),

  // Thermometers (bulb first, strictly increasing to the tip).
  ...thermos.map(cells => new Thermo(...cells)),

  // Skyscraper outside clues. graph.column() runs top-to-bottom, so a
  // top-of-column clue uses it directly and a bottom-of-column clue uses the
  // reversed order (Skyscraper is directional: the first cell is nearest the
  // clue).
  Skyscraper.fromCells(4, graph.column(1), geometry), // top of column 1
  Skyscraper.fromCells(4, graph.column(4), geometry), // top of column 4
  Skyscraper.fromCells(4, graph.column(9), geometry), // top of column 9
  Skyscraper.fromCells(4, graph.column(4).reverse(), geometry), // bottom of column 4
  Skyscraper.fromCells(6, graph.column(6).reverse(), geometry), // bottom of column 6
  Skyscraper.fromCells(4, graph.column(7).reverse(), geometry), // bottom of column 7
];
