// Title: Close Neighbors
// Author: Dennis Chen
// Video: https://www.youtube.com/watch?v=fwraGPO6vxU
// Source: https://app.crackingthecryptic.com/sudoku/LFJg87q9gt

// Standard sudoku (rows, columns, 3x3 boxes all-different) plus one global
// rule: every cell's digit must be orthogonally adjacent to at least one
// cell holding a consecutive digit (a WhiteDot pair). For each cell this is
// an Or() over a WhiteDot with each of its orthogonal neighbours -- corner
// and edge cells naturally have fewer neighbours to Or over, which handles
// digit 1 (needs a 2) and digit 9 (needs an 8) without special-casing.

const graph = cellGraph('9x9');

const closeNeighbours = graph.cells().map(
  cell => new Or(graph.neighbours(cell).map(n => new WhiteDot(cell, n))));

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C8', 2), new Given('R1C9', 5),
  new Given('R2C6', 7), new Given('R2C7', 4),
  new Given('R3C3', 4), new Given('R3C4', 1),
  new Given('R4C1', 7), new Given('R4C2', 6),
  new Given('R4C7', 8), new Given('R4C8', 5),
  new Given('R5C5', 6), new Given('R5C6', 5),
  new Given('R7C4', 3), new Given('R7C5', 4),
  new Given('R8C2', 7), new Given('R8C3', 3),
  new Given('R8C8', 1), new Given('R8C9', 9),
  new Given('R9C6', 1), new Given('R9C7', 5),

  ...closeNeighbours,
];
