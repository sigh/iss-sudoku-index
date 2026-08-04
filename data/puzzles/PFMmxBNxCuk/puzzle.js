// Title: Implosion
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=PFMmxBNxCuk
// Source: https://app.crackingthecryptic.com/sudoku/LPGHR89p3D

// Normal sudoku rules apply (standard 3x3 boxes). Thermo: digits increase
// from the bulb. X/V: the joined pair sums to 10/5. Each outside diagonal
// clue is a little-killer sum walked from its entry cell to the far edge.
const geometry = cellGeometry('9x9');
const graph = cellGraph(geometry);

const thermos = [
  ['R2C2', 'R3C3', 'R4C4'],
  ['R2C5', 'R3C5', 'R4C5'],
  ['R3C7', 'R4C6'],
  ['R5C9', 'R5C8', 'R5C7', 'R5C6'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
  ['R8C2', 'R7C3', 'R6C4'],
  ['R9C5', 'R8C5', 'R7C5', 'R6C5'],
  ['R7C7', 'R6C6'],
];

const diagonals = [
  { total: 20, cells: graph.ray('R5C1', -1, 1) },
  { total: 30, cells: graph.ray('R9C1', -1, 1) },
  { total: 21, cells: graph.ray('R9C9', -1, -1) },
  { total: 20, cells: graph.ray('R5C9', -1, -1) },
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...diagonals.map(({ total, cells }) => LittleKiller.fromCells(total, cells, geometry)),
  new X('R3C1', 'R3C2'),
  new X('R2C9', 'R3C9'),
  new X('R5C3', 'R5C4'),
  new X('R6C2', 'R6C3'),
  new V('R6C7', 'R6C8'),
  new V('R4C7', 'R4C8'),
];
