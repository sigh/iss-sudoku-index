// Title: <=5 Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=ZU5fSDHJq8k
// Source: https://cracking-the-cryptic.web.app/sudoku/DjttngbQ66

// Normal sudoku rules apply. In addition, every pair of orthogonally-adjacent
// cells has an absolute digit difference of at most 5 (rules panel transcribed
// from the video, since the archived payload carries no rules text).

const graph = cellGraph('9x9');
const maxDiffKey = Pair.fnToKey((a, b) => Math.abs(a - b) <= 5, 9);

// Every orthogonal adjacency in the grid is one of two shifted templates: an
// edge to the cell on the right, or an edge to the cell below. Replicate each
// template over every cell that has that neighbour, so every adjacency is
// covered exactly once without hand-enumerating 144 pairs.
const rightNeighbourOrigins = graph.cells().filter(cell => graph.step(cell, 0, 1));
const downNeighbourOrigins = graph.cells().filter(cell => graph.step(cell, 1, 0));

return [
  new Shape('9x9'),

  // The puzzle's 11 given digits, as shown on screen in the video.
  new Given('R1C9', 1),
  new Given('R2C2', 8),
  new Given('R4C1', 8),
  new Given('R4C5', 1),
  new Given('R5C3', 3),
  new Given('R5C5', 6),
  new Given('R5C6', 2),
  new Given('R7C8', 9),
  new Given('R8C1', 4),
  new Given('R8C3', 7),
  new Given('R8C4', 9),

  graph.makeReplicate(
    new Pair(maxDiffKey, 'max diff 5', 'R1C1', 'R1C2'),
    rightNeighbourOrigins),
  graph.makeReplicate(
    new Pair(maxDiffKey, 'max diff 5', 'R1C1', 'R2C1'),
    downNeighbourOrigins),
];
