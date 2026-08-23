// Title: Grilled Cheese
// Author: Subtitle
// Video: https://www.youtube.com/watch?v=05ld6pv8w-M
// Source: https://app.crackingthecryptic.com/sudoku/MQdm4GLpjD

// Normal Sudoku rules apply. Digits along thermometers increase from the
// bulb. Outside clues are Sandwich sums: the sum of the digits strictly
// between the 1 and the 9 in that row/column.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const sandwiches = [
  Sandwich.fromCells(9, graph.row(1), geometry),
  Sandwich.fromCells(19, graph.row(2), geometry),
  Sandwich.fromCells(20, graph.row(4), geometry),
  Sandwich.fromCells(18, graph.row(6), geometry),
  Sandwich.fromCells(7, graph.row(7), geometry),
  Sandwich.fromCells(35, graph.row(9), geometry),
  Sandwich.fromCells(9, graph.column(3), geometry),
  Sandwich.fromCells(16, graph.column(5), geometry),
  Sandwich.fromCells(20, graph.column(7), geometry),
  Sandwich.fromCells(28, graph.column(9), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  // Thermometers transcribed from the drawn lines; each starts at its
  // circular bulb end (source `lines[].wayPoints[0]`).
  new Thermo('R2C1', 'R1C1', 'R1C2'),
  new Thermo('R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C6'),
  new Thermo('R6C8', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R2C7'),
  new Thermo('R3C3', 'R4C3', 'R5C3', 'R6C3'),
  new Thermo('R6C6', 'R6C5', 'R6C4'),
  new Thermo('R7C5', 'R8C5', 'R9C5'),
  new Thermo('R9C8', 'R9C7', 'R9C6'),
  new Thermo('R9C2', 'R9C3', 'R9C4'),
];
