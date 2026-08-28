// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=e7MaN8yY3XE
// Source: https://cracking-the-cryptic.web.app/sudoku/TdQN63RmmL

// Normal sudoku rules apply (standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes). One given digit, R5C5=6.
// Nine cells are shaded grey (drawn geometry). Per the video description,
// each grey cell's digit equals the sum of the digits in the cells
// orthogonally surrounding it (2 neighbours for the corner cell R1C1, 3 for
// an edge cell, 4 for an interior cell). Encoded below as one Arrow per
// grey cell: the grey cell is the bulb (sum target), its in-grid
// orthogonal neighbours (from cellGraph().neighbours) are the arm.

const graph = cellGraph('9x9');

const greyCells = [
  // row, col (1-indexed); provenance: the puzzle's drawn grey-shaded cells.
  [1, 1], [3, 2], [7, 1], [5, 3], [7, 4], [9, 7], [1, 5], [4, 7], [4, 9],
].map(([row, col]) => makeCellId(row, col));

const neighbourSums = greyCells.map(
  cell => new Arrow(cell, ...graph.neighbours(cell)));

return [
  new Shape('9x9'),

  new Given('R5C5', 6),

  ...neighbourSums,
];
