// Title: Number 9... Number 9... Number 9...
// Author: Olli Wright
// Video: https://www.youtube.com/watch?v=kUA_KqhyRu8
// Source: https://sudokupad.app/x2wmck35ak

// Normal Sudoku. Each listed little-killer diagonal and sandwich lane has clue 9.
const geometry = cellGeometry('9x9');

const littleKillers = [
  // Diagonals transcribed from the six drawn arrows.
  ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3', 'R6C2', 'R7C1'],
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R8C9', 'R9C8'],
  ['R7C9', 'R8C8', 'R9C7'],
];

const sandwiches = [
  // Row and column lanes transcribed from the seven drawn sandwich clues.
  ['R3C1', 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8', 'R3C9'],
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R4C7', 'R4C8', 'R4C9'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R5C8', 'R5C9'],
  ['R7C1', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R7C9'],
  ['R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3', 'R8C3', 'R9C3'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4', 'R8C4', 'R9C4'],
  ['R1C7', 'R2C7', 'R3C7', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7'],
];

return [
  new Shape('9x9'),
  // The one-cell little killers fix their cells to their clue values.
  new Given('R1C1', 9),
  new Given('R9C9', 9),
  ...littleKillers.map(cells => LittleKiller.fromCells(9, cells, geometry)),
  ...sandwiches.map(cells => Sandwich.fromCells(9, cells, geometry)),
];
