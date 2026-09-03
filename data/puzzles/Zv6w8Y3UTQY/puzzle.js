// Title: Chaos Construction: Exclusions (8x8)
// Author: KNT
// Video: https://www.youtube.com/watch?v=Zv6w8Y3UTQY
// Source: https://sudokupad.app/3rr7h8xl3w

// Rules:
//   Place the digits from 1 to 8 exactly once in every row, column and region.
//   Each region consists of eight orthogonally connected cells and must be
//   located by the solver.
//   A cell with an arrow (or arrows) indicates how many cells in the indicated
//   directions combined do not belong to the same region as that cell.
//
// Each arrow's ray runs from its own cell to the edge of the grid; a cell
// carrying several arrows counts over all of its rays combined ("combined").
// The arrow cell itself is never counted: it is in its own region.
// The grid has no givens and no drawn region borders. Nothing is omitted.

// Arrows transcribed from the drawn arrowheads: the cell each arrow sits in,
// then one (dRow, dCol) step per arrowhead in that cell, with row increasing
// downwards and column increasing to the right. Four of the arrowheads are
// diagonal.
const ARROWS = [
  { cell: 'R1C4', directions: [[1, 1]] },
  { cell: 'R2C3', directions: [[0, -1], [1, -1], [1, 0], [1, 1]] },
  { cell: 'R2C8', directions: [[1, 0]] },
  { cell: 'R3C1', directions: [[-1, 1], [1, 1]] },
  { cell: 'R4C4', directions: [[0, -1]] },
  { cell: 'R4C8', directions: [[-1, 0]] },
  { cell: 'R5C4', directions: [[0, -1]] },
  { cell: 'R5C8', directions: [[-1, 0]] },
  { cell: 'R6C2', directions: [[0, -1], [0, 1]] },
  { cell: 'R6C4', directions: [[0, -1], [0, 1]] },
  { cell: 'R6C7', directions: [[-1, -1], [1, 0]] },
];

const graph = cellGraph('8x8');
// The chaos-construction region-label cell paired with each grid cell.
const cc = graph.makeOverlay('CC');

// Cell order fed to the machine: the arrow cell's digit, then the arrow cell's
// own region label, then the region label of every ray cell. So the first
// symbol is the required count, the second is the region the ray cells are
// compared against, and every later symbol adds one when it differs from it.
const exclusionCountSpec = {
  startState: { target: null, region: null, count: 0 },
  transition({ target, region, count }, value) {
    if (target === null) return { target: value, region: null, count: 0 };
    if (region === null) return { target, region: value, count: 0 };
    const newCount = count + (value === region ? 0 : 1);
    if (newCount > target) return undefined;
    return { target, region, count: newCount };
  },
  accept: ({ target, region, count }) => region !== null && count === target,
};
const exclusionCountNFA = NFA.encodeSpec(exclusionCountSpec, 8);

const arrowClues = ARROWS.map(({ cell, directions }) => {
  // ray() includes the arrow cell itself, which is dropped from each arm.
  const rayCells = directions.flatMap(
    ([dRow, dCol]) => graph.ray(cell, dRow, dCol).slice(1));
  return new NFA(
    exclusionCountNFA, 'Exclusions', cell, ...cc.at([cell, ...rayCells]));
});

return [
  new Shape('8x8'),
  new NoBoxes(),
  new ChaosConstruction(),
  ...arrowClues,
];
