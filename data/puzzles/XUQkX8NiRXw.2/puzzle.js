// Title: March 10, 2022: Consecutive/LK
// Author: clover!
// Video: https://www.youtube.com/watch?v=XUQkX8NiRXw
// Source: https://tinyurl.com/nhcee9ar

// Normal sudoku rules apply (rows, columns, and boxes all-different --
// standard for a plain 9x9 Shape). Little Killer: each off-grid diagonal
// arrow sums the digits along the indicated diagonal, values may repeat
// (LittleKiller's default semantics -- the rules state no distinctness).
// White dot: digits on either side of a drawn dot are consecutive
// (WhiteDot). The rules state explicitly that not all dots are given, so
// an unmarked pair carries no constraint -- plain WhiteDot per drawn pair,
// not a StrictKropki-style negative over the whole grid.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Little killer diagonals, from the payload's littlekillersum entries.
// Each entry gives an off-grid marker cell, a direction, and the on-grid
// diagonal cells starting adjacent to the marker; graph.ray walks the same
// diagonal out to the grid edge from that first cell.
const littleKillers = [
  LittleKiller.fromCells(6, graph.ray('R2C1', -1, 1), geometry),
  LittleKiller.fromCells(8, graph.ray('R1C8', 1, 1), geometry),
  LittleKiller.fromCells(10, graph.ray('R8C9', 1, -1), geometry),
  LittleKiller.fromCells(12, graph.ray('R9C2', -1, -1), geometry),
  LittleKiller.fromCells(30, graph.ray('R4C1', -1, 1), geometry),
  LittleKiller.fromCells(6, graph.ray('R6C9', 1, -1), geometry),
];

// White dots, from the payload's difference entries (each cell pair carries
// no explicit "value", i.e. the default consecutive/white-dot reading).
// One WhiteDot per drawn pair keeps each dot independent of its neighbours.
const whiteDotPairs = [
  ['R2C1', 'R1C1'], ['R1C1', 'R1C2'], ['R1C9', 'R1C8'], ['R2C9', 'R1C9'],
  ['R9C8', 'R9C9'], ['R8C9', 'R9C9'], ['R8C1', 'R9C1'], ['R9C2', 'R9C1'],
  ['R3C2', 'R3C3'], ['R2C3', 'R3C3'], ['R3C7', 'R2C7'], ['R3C8', 'R3C7'],
  ['R7C8', 'R7C7'], ['R8C7', 'R7C7'], ['R7C3', 'R7C2'], ['R7C3', 'R8C3'],
  ['R5C1', 'R5C2'], ['R5C3', 'R5C2'], ['R5C8', 'R5C7'], ['R5C9', 'R5C8'],
  ['R2C5', 'R3C5'], ['R7C5', 'R8C5'],
];
const whiteDots = whiteDotPairs.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),

  // Givens.
  new Given('R2C5', 5),
  new Given('R3C3', 6),
  new Given('R3C7', 7),
  new Given('R4C6', 6),
  new Given('R5C2', 6),
  new Given('R5C8', 3),
  new Given('R6C4', 5),
  new Given('R7C3', 3),
  new Given('R7C7', 2),
  new Given('R8C5', 8),

  ...littleKillers,
  ...whiteDots,
];
