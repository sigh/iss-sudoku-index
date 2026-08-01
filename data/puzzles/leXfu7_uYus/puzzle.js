// Title: Seventy
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=leXfu7_uYus
// Source: https://sudokupad.app/james-sinclair/seventy

// Rules encoded: normal sudoku; rising diagonal no-repeat; two even squares;
// eight arrow shafts (circle equals the sum of each shaft); and two little killers.

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const arrows = [
  // Drawn arrow shafts, each beginning at its circle.
  new Arrow('R4C4', 'R4C5', 'R5C6'),
  new Arrow('R6C6', 'R6C5', 'R5C4'),
  new Arrow('R6C2', 'R7C2', 'R8C1', 'R9C2'),
  new Arrow('R6C2', 'R6C3', 'R7C4'),
  new Arrow('R2C6', 'R2C7', 'R1C8', 'R2C9'),
  new Arrow('R2C6', 'R3C6', 'R4C7'),
  new Arrow('R8C8', 'R7C9', 'R6C9', 'R5C9'),
  new Arrow('R8C8', 'R9C7', 'R9C6', 'R9C5'),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Given('R2C8', 2, 4, 6, 8),
  new Given('R3C3', 2, 4, 6, 8),
  ...arrows,
  // The displayed outside diagonals, transcribed from the two little-killer clues.
  LittleKiller.fromCells(56, graph.ray('R2C9', 1, -1), geometry),
  LittleKiller.fromCells(14, graph.ray('R1C8', 1, -1), geometry),
];
