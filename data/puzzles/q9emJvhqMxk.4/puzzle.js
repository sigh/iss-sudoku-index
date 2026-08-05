// Title: Hard Puzzle
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/2p9jw39k

// Normal Sudoku rules apply. Orthogonally adjacent digits cannot sum to 5 or
// 10. The source lists no positive XV marks, so every horizontal and vertical
// grid edge is constrained.
const graph = cellGraph('9x9');
const notFiveOrTen = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const rightOrigins = graph.cells().filter(cell => graph.step(cell, 0, 1));
const downOrigins = graph.cells().filter(cell => graph.step(cell, 1, 0));

return [
  new Shape('9x9'),

  // Givens transcribed from the 9x9 source grid.
  new Given('R1C3', 1), new Given('R1C8', 3),
  new Given('R2C2', 6), new Given('R2C7', 2), new Given('R2C9', 4),
  new Given('R3C1', 4), new Given('R3C6', 6), new Given('R3C8', 1),
  new Given('R4C5', 3), new Given('R4C7', 8),
  new Given('R5C4', 2), new Given('R5C6', 4),
  new Given('R6C3', 6), new Given('R6C5', 1),
  new Given('R7C2', 3), new Given('R7C4', 8), new Given('R7C9', 2),
  new Given('R8C1', 2), new Given('R8C3', 4), new Given('R8C8', 8),
  new Given('R9C2', 1), new Given('R9C7', 3),

  // Each template covers one orientation of orthogonal grid edge.
  graph.makeReplicate(
    new Pair(notFiveOrTen, '', 'R1C1', 'R1C2'), rightOrigins),
  graph.makeReplicate(
    new Pair(notFiveOrTen, '', 'R1C1', 'R2C1'), downOrigins),
];
