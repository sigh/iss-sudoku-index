// Title: Spooky Action at a Distance
// Author: Michael Lefkowitz
// Video: https://www.youtube.com/watch?v=wOz0UWQ1WcA
// Source: https://sudokupad.app/lipt9yn6r4

// Normal sudoku. Some cells are ghosts. A ghost containing N stares along a
// diagonal at another ghost containing N exactly N steps away. The eyes fix
// the gaze direction of each visible ghost; hidden ghosts may face along any
// diagonal. A headstone is the sum of the ghost digits in its column.

const NORMAL = 1;
const GHOST = 2;

const graph = cellGraph('9x9');
const gridCells = graph.cells();
const ghost = graph.makeOverlay('VG');

// Only the two headstone columns need contribution cells. A contribution is
// 9 for a normal cell and the grid digit for a ghost cell. Together with the
// 1/2 ghost flag this makes each normal cell contribute 18 and each ghost
// contribute 18 plus its digit, allowing a linear headstone Sum.
const headstoneGridCells = [1, 3].flatMap(c => graph.column(c));
const contribution = graph.makeOverlay('VH', headstoneGridCells);

const ghostCells = ghost.at(gridCells);
const ghostCandidates = ghost.makeReplicate(
  [new Given(ghostCells[0], NORMAL, GHOST)],
  ghostCells,
);

const visibleGhosts = [
  ['R2C5', 1, -1],
  ['R5C5', -1, -1],
  ['R5C8', -1, -1],
  ['R6C4', -1, 1],
  ['R6C6', 1, 1],
  ['R7C9', -1, -1],
  ['R8C5', -1, -1],
];
const visibleDirection = new Map(
  visibleGhosts.map(([cell, dr, dc]) => [cell, [[dr, dc]]]),
);
const diagonalDirections = [[-1, -1], [-1, 1], [1, -1], [1, 1]];

// One branch is "not a ghost". Every other branch chooses the stared-at
// partner: its offset fixes N, and both cells must contain N and be ghosts.
function sightRule(cell) {
  const { row, col } = parseCellId(cell);
  const directions = visibleDirection.get(cell) || diagonalDirections;
  const partners = [];
  for (const [dr, dc] of directions) {
    for (let distance = 1; distance <= 9; distance++) {
      const targetRow = row + dr * distance;
      const targetCol = col + dc * distance;
      if (targetRow < 1 || targetRow > 9 || targetCol < 1 || targetCol > 9) break;
      const target = makeCellId(targetRow, targetCol);
      partners.push(new And([
        new Given(cell, distance),
        new Given(target, distance),
        new Given(ghost.at(target), GHOST),
      ]));
    }
  }
  return new Or([new Given(ghost.at(cell), NORMAL), ...partners]);
}

const contributionLinks = headstoneGridCells.map(cell => new Or([
  new And([
    new Given(ghost.at(cell), NORMAL),
    new Given(contribution.at(cell), 9),
  ]),
  new And([
    new Given(ghost.at(cell), GHOST),
    new SameValues(2, cell, contribution.at(cell)),
  ]),
]));

function headstone(column, total) {
  const cells = graph.column(column);
  return new Sum(
    total + 18 * cells.length,
    ...contribution.at(cells),
    ...ghost.at(cells).map(cell => [cell, 9]),
  );
}

return [
  new Shape('9x9'),
  ghost.toVar('ghost flag'),
  contribution.toVar('headstone contribution'),
  ghostCandidates,

  new Given('R6C7', 9),
  ...visibleGhosts.map(([cell]) => new Given(ghost.at(cell), GHOST)),

  ...gridCells.map(sightRule),
  ...contributionLinks,
  headstone(1, 34),
  headstone(3, 13),
];
