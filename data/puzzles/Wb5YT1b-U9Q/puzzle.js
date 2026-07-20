// Title: That Boy Ain't Right
// Author: Scott Williams
// Video: https://www.youtube.com/watch?v=Wb5YT1b-U9Q
// Source: https://sudokupad.app/ue23keydhf

// Standard Sudoku is implicit in Shape. The remaining rules are anti-knight,
// four separate Renban lines, and six sandwich clues.
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const renbans = [
  new Renban('R4C4', 'R5C4', 'R6C4', 'R7C5', 'R6C6'),
  new Renban('R3C6', 'R2C6', 'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R4C8', 'R4C7'),
  new Renban('R7C6', 'R8C6'),
  new Renban('R4C2', 'R5C2'),
];

const sandwiches = [
  Sandwich.fromCells(13, graph.column(2), geometry),
  Sandwich.fromCells(30, graph.column(5), geometry),
  Sandwich.fromCells(0, graph.column(6), geometry),
  Sandwich.fromCells(23, graph.column(8), geometry),
  Sandwich.fromCells(10, graph.row(7), geometry),
  Sandwich.fromCells(3, graph.row(9), geometry),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...renbans,
  ...sandwiches,
];
