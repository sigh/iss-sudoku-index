// Title: April 9, 2022: Touchy Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=wwwmflDjNxE
// Source: https://tinyurl.com/4d5wp4eb

// Normal sudoku rules, plus: every digit must be orthogonally adjacent to at
// least one other digit with a consecutive value (every 1 touches a 2, every
// 4 touches a 3 or 5, etc). For each cell this is a disjunction, over its
// orthogonal neighbours, of the WhiteDot (consecutive) relation between the
// cell and that neighbour.

const graph = cellGraph('9x9');

const touchyRule = graph.cells().map(
  cell => new Or(graph.neighbours(cell).map(n => new WhiteDot(cell, n))));

return [
  new Shape('9x9'),

  new Given('R1C5', 8),
  new Given('R2C4', 6),
  new Given('R2C9', 1),
  new Given('R3C2', 9),
  new Given('R3C6', 1),
  new Given('R3C9', 5),
  new Given('R4C3', 5),
  new Given('R4C5', 1),
  new Given('R4C7', 6),
  new Given('R5C1', 7),
  new Given('R5C4', 4),
  new Given('R5C6', 2),
  new Given('R5C9', 9),
  new Given('R6C3', 8),
  new Given('R6C5', 3),
  new Given('R6C7', 7),
  new Given('R7C1', 1),
  new Given('R7C4', 2),
  new Given('R7C8', 6),
  new Given('R8C1', 5),
  new Given('R8C6', 9),
  new Given('R9C5', 7),

  ...touchyRule,
];
