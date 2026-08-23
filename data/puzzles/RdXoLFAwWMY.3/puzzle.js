// Title: September 12, 2021: Phortress
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=RdXoLFAwWMY
// Source: https://tinyurl.com/9e83sw4z

// Normal sudoku rules apply. Digits in grey cells are greater than the
// digits in orthogonally adjacent white cells.
//
// The grey cells (a ring around rows/cols 3-7, drawn shading in the
// payload) are given as literal data below. The grey-white edges the
// "greater than" rule applies to are derived from that ring rather than
// hand-enumerated, so every orthogonal grey/white boundary is covered
// exactly once and no grey-grey or white-white pair is included.
const greyCells = [
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C3', 'R4C7',
  'R5C3', 'R5C7',
  'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
];
const greySet = new Set(greyCells);
const graph = cellGraph('9x9');

const greaterThanEdges = [];
for (const cell of greyCells) {
  for (const neighbor of graph.neighbours(cell)) {
    if (!greySet.has(neighbor)) greaterThanEdges.push([cell, neighbor]);
  }
}

return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C9', 3),
  new Given('R2C5', 7),
  new Given('R3C2', 2),
  new Given('R3C8', 6),
  new Given('R4C4', 4),
  new Given('R4C5', 3),
  new Given('R4C6', 6),
  new Given('R5C4', 7),
  new Given('R5C6', 1),
  new Given('R6C4', 8),
  new Given('R6C5', 5),
  new Given('R6C6', 2),
  new Given('R7C2', 3),
  new Given('R7C8', 5),
  new Given('R8C5', 4),
  new Given('R9C1', 9),
  new Given('R9C9', 4),

  // One GreaterThan per grey/white edge (grey cell listed first) so each
  // pair is scoped to exactly that boundary; a single GreaterThan over the
  // whole ring plus its neighbours would also constrain grey-grey and
  // white-white adjacencies, which the rule does not mention.
  ...greaterThanEdges.map(([grey, white]) => new GreaterThan(grey, white)),
];
