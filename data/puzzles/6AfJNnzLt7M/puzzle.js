// Title: The Sword
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=6AfJNnzLt7M
// Source: https://app.crackingthecryptic.com/webapp/f8qbbtF9Lt

// Normal sudoku rules apply. Eight little-killer diagonals give the sum of
// the digits from the indicated arrow into the grid to where the diagonal
// exits (digits may repeat along a diagonal). No digit may appear in the
// same relative position within two different 3x3 boxes.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Each entry is [start cell, dRow, dCol, sum], read off the arrow's drawn
// direction and its paired outside-sum overlay.
const littleKillers = [
  ['R2C1', -1, 1, 10],
  ['R1C4', 1, 1, 23],
  ['R1C7', 1, 1, 7],
  ['R1C8', 1, 1, 11],
  ['R3C9', 1, -1, 50],
  ['R6C9', 1, -1, 22],
  ['R9C6', -1, -1, 22],
  ['R9C3', -1, -1, 11],
].map(([cell, dr, dc, sum]) =>
  LittleKiller.fromCells(sum, graph.ray(cell, dr, dc), geometry));

return [
  new Shape('9x9'),
  new DisjointSets(),
  ...littleKillers,
];
