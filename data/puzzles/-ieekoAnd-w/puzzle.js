// Title: Twisties
// Author: BremSter
// Video: https://www.youtube.com/watch?v=-ieekoAnd-w
// Source: https://sudokupad.app/r6zqoxq6gz

// Normal Sudoku. Each outside clue is the sum between 1 and 9 in its line.
// Each purple line is a non-repeating set of consecutive digits in any order.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const sandwiches = [
  Sandwich.fromCells(17, graph.column(1), geometry),
  Sandwich.fromCells(20, graph.column(6), geometry),
  Sandwich.fromCells(23, graph.column(7), geometry),
  Sandwich.fromCells(21, graph.row(5), geometry),
  Sandwich.fromCells(10, graph.row(9), geometry),
  Sandwich.fromCells(8, graph.row(8).slice().reverse(), geometry),
];

const renbans = [
  new Renban('R1C1', 'R1C2', 'R2C2', 'R2C3'),
  new Renban('R4C1', 'R5C1', 'R5C2'),
  new Renban('R1C5', 'R2C5', 'R3C5', 'R4C5', 'R4C4'),
  new Renban('R6C6', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Renban('R8C6', 'R8C7', 'R8C8', 'R7C8'),
  new Renban('R5C7', 'R5C8', 'R5C9'),
  new Renban('R2C6', 'R2C7', 'R2C8', 'R3C8'),
  new Renban('R8C3', 'R8C2', 'R9C2', 'R9C1'),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...renbans,
];
