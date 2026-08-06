// Title: Medieval World War
// Author: FastSandals and Timotab
// Video: https://www.youtube.com/watch?v=rOIsQlCnz2M
// Source: https://sudokupad.app/n8sgls1q8a

// Normal sudoku rules apply (default row/column/box all-different).
// Fortress: shaded (gray) cells must be greater than every orthogonally
// adjacent non-fortress cell. Fortress-to-fortress adjacencies are left
// unconstrained since the rule only mentions non-fortress neighbours.
// Arrows: digits along the arrow sum to the digit in its attached circle.

// Shaded fortress cells, transcribed from the underlay shading.
const FORTRESS = [
  'R1C3', 'R2C5', 'R3C3', 'R3C5', 'R3C7',
  'R5C8', 'R6C2', 'R6C6', 'R8C3', 'R9C8',
];
const fortressSet = new Set(FORTRESS);
const graph = cellGraph('9x9');

// Build one GreaterThan per fortress cell, listing the fortress cell first
// followed by its non-fortress orthogonal neighbours: GreaterThan pairs each
// cell with every later-listed grid-adjacent cell as (earlier > later), so
// listing the fortress cell first enforces fortress > each neighbour.
const fortressConstraints = FORTRESS.map(cellId => {
  const origin = parseCellId(cellId);
  const directionRank = id => {
    const position = parseCellId(id);
    if (position.row < origin.row) return 0;
    if (position.row > origin.row) return 1;
    if (position.col < origin.col) return 2;
    return 3;
  };
  const neighbours = graph.neighbours(cellId)
    .filter(id => !fortressSet.has(id))
    .sort((a, b) => directionRank(a) - directionRank(b));
  return new GreaterThan(cellId, ...neighbours);
});

return [
  new Shape('9x9'),

  ...fortressConstraints,

  // Arrows: bulb cell first, then arm cells in path order.
  new Arrow('R3C4', 'R2C4', 'R2C5', 'R2C6'),
  new Arrow('R4C3', 'R5C3', 'R5C4', 'R6C5', 'R7C5'),
  new Arrow('R3C8', 'R4C8', 'R4C7', 'R5C6'),
  new Arrow('R1C3', 'R2C2', 'R3C2'),
  new Arrow('R6C1', 'R7C1', 'R8C2', 'R7C3'),
  new Arrow('R6C2', 'R5C2', 'R4C2'),
  new Arrow('R9C2', 'R9C3', 'R8C4'),
  new Arrow('R9C6', 'R9C5', 'R9C4'),
];
