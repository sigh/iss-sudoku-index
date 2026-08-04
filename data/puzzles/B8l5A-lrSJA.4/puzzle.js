// Title: Single Ladies
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=B8l5A-lrSJA
// Source: https://tinyurl.com/mpdy695n

// Normal sudoku rules apply.
//
// "Cells with outward-facing arrows must contain higher digits than their
// orthogonal neighbours." This is f-puzzles' `maximum` cell type: each listed
// cell is a local maximum, greater than every orthogonal neighbour an arrow
// points to.
//
// The 16 flagged cells (below) form a closed ring -- the border of the
// central 5x5 block -- so every one of them has exactly two orthogonal
// neighbours that are themselves also flagged maximum cells. A literal
// "greater than every orthogonal neighbour" reading is self-contradictory
// along all 16 ring-internal edges (each such pair would require both
// cells to exceed the other), so no arrow is drawn -- and no constraint
// applies -- between two ring cells. Each maximum cell is encoded against
// only its non-ring orthogonal neighbours (always exactly two: the cells
// outside the ring on either side).

const maximumCells = [
  // Ring of 16 cells, i.e. the border of the central 5x5 block (R3-7,C3-7),
  // as drawn by the puzzle's maximum-cell markers.
  'R3C3', 'R5C3', 'R4C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
  'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C6', 'R3C5', 'R3C4',
];
const maximumSet = new Set(maximumCells);
const graph = cellGraph('9x9');

const maxima = maximumCells.map(cell => {
  const targets = graph.neighbours(cell).filter(n => !maximumSet.has(n));
  return new GreaterThan(cell, ...targets);
});

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C1', 3), new Given('R1C2', 7),
  new Given('R1C8', 4), new Given('R1C9', 9),
  new Given('R2C1', 9), new Given('R2C2', 8),
  new Given('R2C8', 6), new Given('R2C9', 3),
  new Given('R4C4', 8), new Given('R4C6', 6),
  new Given('R6C4', 2), new Given('R6C6', 7),
  new Given('R8C1', 5), new Given('R8C2', 9),
  new Given('R8C8', 7), new Given('R8C9', 8),
  new Given('R9C1', 8), new Given('R9C2', 6),
  new Given('R9C8', 9), new Given('R9C9', 4),

  ...maxima,
];
