// Title: My first 9x9
// Author: Chip Sounder
// Video: https://www.youtube.com/watch?v=Mso5LozIIO4
// Source: https://sudokupad.app/m4L8HtQJBM

// Standard Sudoku, thermometers, little-killer diagonals, killer cages,
// arrows, one eight-cell equality class, and the two displayed black dots.
const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const thermos = [
  new Thermo('R8C8', 'R7C7', 'R6C6', 'R5C5', 'R4C4', 'R3C3'),
  new Thermo('R2C4', 'R2C3', 'R3C2', 'R4C2'),
];

const littleKillers = [
  LittleKiller.fromCells(21, graph.ray('R3C9', -1, -1), geometry),
  LittleKiller.fromCells(37, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(43, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(26, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(17, graph.ray('R8C1', 1, 1), geometry),
];

const cages = [
  new Cage(13, 'R2C1', 'R2C2'),
  new Cage(19, 'R1C7', 'R2C7', 'R3C7'),
  new Cage(14, 'R4C5', 'R4C6', 'R5C6'),
];

const arrows = [
  new Arrow('R7C3', 'R6C3', 'R5C3', 'R4C3'),
  new Arrow('R4C7', 'R5C8', 'R6C9'),
];

const greyCells = ['R3C9', 'R2C6', 'R4C1', 'R5C7', 'R6C4', 'R9C2', 'R8C5', 'R7C8'];

return [
  new Shape('9x9'),
  ...thermos,
  ...littleKillers,
  ...cages,
  ...arrows,
  new SameValues(greyCells.length, ...greyCells),
  new BlackDot('R7C1', 'R7C2'),
  new BlackDot('R8C8', 'R8C9'),
];
