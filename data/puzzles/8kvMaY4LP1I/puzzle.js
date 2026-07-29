// Title: Alchemist Sudoku
// Author: Irius
// Video: https://www.youtube.com/watch?v=8kvMaY4LP1I
// Source: https://sudokupad.app/HM48mhR9ff

// Normal Sudoku rules apply. Killer cages have their shown totals with no repeats.
// Arrow-circle digits equal the sum of their arms; thermometers increase from their bulbs.
// Each outside clue is the sum of its indicated diagonal. The orange cells contain 1 through 9.

const cages = [
  // Cage cells and totals transcribed from the drawn cage borders and labels.
  new Cage(21, 'R4C5', 'R5C5', 'R5C4', 'R6C5', 'R5C6'),
  new Cage(13, 'R1C8', 'R2C8', 'R2C7'),
  new Cage(13, 'R2C6', 'R3C6', 'R3C5'),
  new Cage(16, 'R2C3', 'R2C4', 'R2C5'),
  new Cage(12, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(6, 'R8C5', 'R8C6', 'R8C7'),
  new Cage(16, 'R8C4', 'R7C4', 'R7C5'),
  new Cage(16, 'R9C2', 'R8C2', 'R8C3'),
  new Cage(21, 'R4C1', 'R5C1', 'R6C1'),
];

const arrows = [
  new Arrow('R3C7', 'R4C8', 'R5C8'),
  new Arrow('R7C3', 'R6C2', 'R5C2'),
];

const thermos = [
  new Thermo('R5C4', 'R6C5', 'R5C6', 'R4C5', 'R3C5', 'R2C5', 'R1C5'),
  new Thermo('R8C8', 'R7C8', 'R6C8', 'R5C7'),
  new Thermo('R2C2', 'R3C2', 'R4C2', 'R5C3'),
];

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const diagonals = [
  LittleKiller.fromCells(27, graph.ray('R1C4', 1, 1), geometry),
  LittleKiller.fromCells(34, graph.ray('R1C6', 1, -1), geometry),
  LittleKiller.fromCells(24, graph.ray('R4C9', 1, -1), geometry),
  LittleKiller.fromCells(27, graph.ray('R4C1', 1, 1), geometry),
];

// Orange shading identifies these nine cells.
const orange = new AllDifferent(
  'R3C5', 'R4C5', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C5', 'R5C4', 'R5C3');

return [
  new Shape('9x9'),
  new Given('R2C5', 8), new Given('R5C2', 3), new Given('R8C5', 2),
  ...cages,
  ...arrows,
  ...thermos,
  ...diagonals,
  orange,
];
