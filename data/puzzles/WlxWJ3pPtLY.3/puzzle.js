// Title: 4/15/23: Squaring the Circles
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=WlxWJ3pPtLY
// Source: https://tinyurl.com/y6yxkxx4

// Rules encoded:
// - Normal sudoku rules (default row/column/box all-different).
// - Fortress: a grey cell's digit must be greater than every orthogonally
//   adjacent white (non-grey) cell's digit. Adjacent grey-grey pairs carry no
//   constraint -- the rule text scopes the comparison to white neighbours
//   only.
// - Quadruples: each circle's four listed digits must all appear among the
//   four cells of its surrounding 2x2 block, in some order.

const graph = cellGraph('9x9');

// Grey ("Fortress") cells, transcribed from the source's shaded overlay.
const greyCells = [
  'R1C1', 'R1C2', 'R2C1', 'R2C2',
  'R1C8', 'R1C9', 'R2C8', 'R2C9',
  'R3C3', 'R3C4', 'R4C3', 'R4C4',
  'R3C6', 'R3C7', 'R4C6', 'R4C7',
  'R6C3', 'R6C4', 'R7C3', 'R7C4',
  'R6C6', 'R6C7', 'R7C6', 'R7C7',
  'R8C1', 'R8C2', 'R9C1', 'R9C2',
  'R8C8', 'R8C9', 'R9C8', 'R9C9',
];
const greySet = new Set(greyCells);

// Every grey-cell -> white-neighbour edge becomes one GreaterThan(grey, white).
// Neighbours are derived from the grid geometry, not hand-enumerated.
const fortress = greyCells.flatMap(
  cell => graph.neighbours(cell)
    .filter(n => !greySet.has(n))
    .map(n => new GreaterThan(cell, n)));

// Quadruple circles, transcribed from the source's drawn clue circles: each
// entry is [topLeftCell of the surrounding 2x2, required values].
const quads = [
  ['R1C1', [1, 3, 5, 9]],
  ['R1C8', [2, 4, 6, 8]],
  ['R6C3', [3, 6, 8, 9]],
  ['R3C3', [5, 7, 8, 9]],
  ['R3C6', [4, 6, 8, 9]],
  ['R8C1', [5, 6, 7, 8]],
  ['R8C8', [4, 6, 8, 9]],
  ['R6C6', [5, 6, 7, 8]],
].map(([topLeft, values]) => new Quad(topLeft, ...values));

// Givens, transcribed from the source's grid.
return [
  new Shape('9x9'),
  new Given('R1C9', 2),
  new Given('R2C8', 4),
  new Given('R4C6', 8),
  new Given('R6C4', 3),
  new Given('R8C2', 7),
  new Given('R9C1', 5),
  ...fortress,
  ...quads,
];
