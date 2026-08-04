// Title: 3/25/23: Difference 2 Neighbor
// Author: clover!
// Video: https://www.youtube.com/watch?v=0Zieiss9eo0
// Source: https://tinyurl.com/3z6sn5fx

// Normal sudoku rules apply. Each digit in a gray cell must have at least one
// orthogonal neighbor (in a gray or white cell) that is exactly 2 more or 2
// less than it. Undrawn (white) cells carry no such requirement of their own
// -- the rules text notes shading is not exhaustive over cells that would
// satisfy the property, only over cells the rule is asserted for.

const graph = cellGraph('9x9');

// Shaded (#a8a8a8) cells the rule applies to -- from the grid's per-cell `c`.
const grayCells = [
  'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8',
  'R4C3', 'R4C7',
  'R5C5',
  'R6C3', 'R6C7',
  'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9',
];

// Shared relation key: true when two cells' digits differ by exactly 2.
const diffTwoKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 2, 9);

// One Or per gray cell: at least one of its (computed, not hand-enumerated)
// orthogonal neighbors must satisfy diffTwoKey with it.
const neighborRule = cell => new Or(
  graph.neighbours(cell).map(n => new Pair(diffTwoKey, 'Diff2Neighbor', cell, n))
);

return [
  new Shape('9x9'),

  new Given('R1C1', 7), new Given('R1C3', 3), new Given('R1C5', 1),
  new Given('R1C7', 5), new Given('R1C9', 9),
  new Given('R2C2', 4), new Given('R2C4', 2), new Given('R2C6', 8),
  new Given('R2C8', 6),
  new Given('R4C3', 4), new Given('R4C7', 1),
  new Given('R5C2', 6), new Given('R5C8', 4),
  new Given('R6C3', 9), new Given('R6C7', 2),
  new Given('R8C2', 7), new Given('R8C4', 9), new Given('R8C6', 3),
  new Given('R8C8', 1),
  new Given('R9C1', 1), new Given('R9C3', 8), new Given('R9C5', 4),
  new Given('R9C7', 6), new Given('R9C9', 2),

  ...grayCells.map(neighborRule),
];
