// Title: Sudoku Attempt #2
// Author: Sarah T
// Video: https://www.youtube.com/watch?v=TrpgBeReCDg
// Source: https://sudokupad.app/kqbg7qgzi0

// Sandwich clues are identified by the row or column they cover. The source
// draws every column clue above the grid and every row clue to its left.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const sandwiches = [
  Sandwich.fromCells(35, graph.column(1), geometry),
  Sandwich.fromCells(10, graph.column(2), geometry),
  Sandwich.fromCells(15, graph.column(4), geometry),
  Sandwich.fromCells(8, graph.column(5), geometry),
  Sandwich.fromCells(18, graph.column(9), geometry),
  Sandwich.fromCells(9, graph.row(1), geometry),
  Sandwich.fromCells(4, graph.row(2), geometry),
  Sandwich.fromCells(4, graph.row(4), geometry),
  Sandwich.fromCells(8, graph.row(6), geometry),
  Sandwich.fromCells(18, graph.row(7), geometry),
  Sandwich.fromCells(0, graph.row(9), geometry),
];

const xvClues = [
  new V('R2C4', 'R3C4'),
  new V('R7C5', 'R7C6'),
  new V('R7C2', 'R7C3'),
  new X('R6C5', 'R6C6'),
  new X('R4C4', 'R5C4'),
];

const kropkiClues = [
  new WhiteDot('R1C8', 'R1C9'),
  new WhiteDot('R4C9', 'R5C9'),
  new WhiteDot('R5C9', 'R6C9'),
  new BlackDot('R3C9', 'R4C9'),
  new BlackDot('R1C2', 'R1C3'),
];

return [
  new Shape('9x9'),
  ...sandwiches,
  ...xvClues,
  ...kropkiClues,
  new Cage(11, 'R7C2', 'R8C2', 'R9C2'),
];
