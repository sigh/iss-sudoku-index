// Title: Unique Arrow Sandwiches
// Author: Tulrak
// Video: https://www.youtube.com/watch?v=-M1gMfetuhI
// Source: https://app.crackingthecryptic.com/pL2hqmmP6G

// Normal Sudoku rules apply. The five listed outside clues are Sandwich sums;
// each X pair sums to 10; each arrow shaft sums to its circle; arrow circles differ.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const sandwiches = [
  Sandwich.fromCells(29, graph.row(2), geometry),
  Sandwich.fromCells(11, graph.row(3), geometry),
  Sandwich.fromCells(29, graph.row(5), geometry),
  Sandwich.fromCells(26, graph.row(9), geometry),
  Sandwich.fromCells(26, graph.column(3), geometry),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  new X('R1C1', 'R1C2'),
  new X('R3C1', 'R3C2'),
  new X('R2C5', 'R2C6'),
  new X('R5C3', 'R6C3'),
  // Arrow paths are transcribed from the five drawn shafts and circles.
  new Arrow('R1C4', 'R2C3', 'R2C2', 'R2C1'),
  new Arrow('R4C8', 'R3C7', 'R3C8', 'R3C9'),
  new Arrow('R4C5', 'R4C6', 'R5C7', 'R5C8', 'R5C9'),
  new Arrow('R6C9', 'R7C8', 'R8C8'),
  new Arrow('R9C5', 'R8C4', 'R7C3', 'R6C2', 'R5C1'),
  new AllDifferent('R1C4', 'R4C8', 'R4C5', 'R6C9', 'R9C5'),
];
