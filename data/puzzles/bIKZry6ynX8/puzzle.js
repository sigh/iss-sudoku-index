// Title: Ca fait la rue Michel
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=bIKZry6ynX8
// Source: https://sudokupad.app/daypits38m

// Rules encoded, all of them:
//  - Normal sudoku, with the given R3C9 = 9.
//  - Every cell is either a labyrinth cell or a wall cell. The VW overlay holds
//    that choice, one Var per grid cell, valued LAB or WALL.
//  - The labyrinth cells form a single orthogonally connected region.
//  - No 2x2 block consists entirely of labyrinth cells.
//  - No dead ends: every labyrinth cell is orthogonally adjacent to at least
//    two other labyrinth cells.
//  - The wall cells fall into groups of exactly four orthogonally connected
//    cells; wall cells of different groups never touch, not even diagonally;
//    the four digits of a group are distinct and sum to 14.
//  - A drawn X means its two cells sum to 10, and the Xs are exhaustive
//    ("ALL Xs ARE GIVEN"): no unmarked pair of orthogonally adjacent cells
//    sums to 10.
//  - A framed X joins two cells of the same type, an unframed X joins one
//    labyrinth cell and one wall cell. "An X is always framed when it lies
//    between two cells of the same type: either labyrinth cells or wall cells"
//    is read as the notation key it states -- the frame marks the same-type
//    case, and its absence therefore marks the different-type case.

const LAB = 1;
const WALL = 2;
const GROUP_SIZE = 4;
const GROUP_SUM = 14;

const graph = cellGraph('9x9');
const wall = graph.makeOverlay('VW');
const cells = graph.cells();

const readingIndex = (cell) => {
  const { row, col } = parseCellId(cell);
  return (row - 1) * 9 + (col - 1);
};
const isLab = (cell) => new Given(wall.at(cell), LAB);
const isWall = (cell) => new Given(wall.at(cell), WALL);

// Every 2x2 block holds at least one wall cell.
const blocks2x2 = [];
for (let row = 1; row < 9; row++) {
  for (let col = 1; col < 9; col++) {
    blocks2x2.push(graph.block(makeCellId(row, col), 2, 2));
  }
}

// Every diagonally adjacent pair of grid cells, with the two cells that
// complete its 2x2 block.
const diagonalPairs = [];
for (let row = 1; row < 9; row++) {
  for (let col = 1; col < 9; col++) {
    const tl = makeCellId(row, col);
    const tr = makeCellId(row, col + 1);
    const bl = makeCellId(row + 1, col);
    const br = makeCellId(row + 1, col + 1);
    diagonalPairs.push([tl, br, tr, bl], [tr, bl, tl, br]);
  }
}

// Every four-cell orthogonally connected set containing `anchor` in which no
// king-neighbour of `anchor` comes before it in reading order -- i.e. every
// shape a wall group could have, given that the cell is one the rule below is
// not let off. Grown one neighbour at a time from the anchor, then filtered and
// de-duplicated. (Being first in reading order is a stronger test than this and
// the wrong one: in the group R1C3 + R2C1 + R2C2 + R2C3 neither R1C3 nor R2C1
// has an earlier king-neighbour inside the group.)
function groupShapesHeadedBy(anchor) {
  const anchorIndex = readingIndex(anchor);
  const earlierKing = new Set(
    graph.kingNeighbours(anchor).filter(
      (other) => readingIndex(other) < anchorIndex));
  const found = new Map();
  const extend = (group) => {
    if (group.length === GROUP_SIZE) {
      if (group.some((cell) => earlierKing.has(cell))) return;
      const sorted = group.slice().sort((a, b) => readingIndex(a) - readingIndex(b));
      found.set(sorted.join(), sorted);
      return;
    }
    const candidates = new Set();
    for (const cell of group) {
      for (const next of graph.neighbours(cell)) {
        if (!group.includes(next)) candidates.add(next);
      }
    }
    for (const next of candidates) extend([...group, next]);
  };
  extend([anchor]);
  return [...found.values()];
}

// The cells orthogonally adjacent to a group but outside it.
function groupOutside(group) {
  const inGroup = new Set(group);
  const outside = new Set();
  for (const cell of group) {
    for (const next of graph.neighbours(cell)) {
      if (!inGroup.has(next)) outside.add(next);
    }
  }
  return [...outside];
}

// The wall rule, stated once per cell. A cell is let off when it is labyrinth,
// or when a king-neighbour before it in reading order is a wall: a group never
// touches another group even diagonally, so that neighbour shares this cell's
// group, and some cell of the group is let off by nobody and carries the check.
// Where the cell is not let off, its group must be one of the shapes above:
// those four cells are walls, everything orthogonally adjacent to them is
// labyrinth -- which both cuts the group off at exactly four cells and holds
// other groups away from its sides -- and the four digits are distinct and sum
// to 14.
const wallGroups = cells.map((cell) => new Or([
  isLab(cell),
  ...graph.kingNeighbours(cell)
    .filter((other) => readingIndex(other) < readingIndex(cell))
    .map(isWall),
  ...groupShapesHeadedBy(cell).map((group) => new And([
    ...group.map(isWall),
    ...groupOutside(group).map(isLab),
    new Cage(GROUP_SUM, ...group),
  ])),
]));

// Diagonal separation, which the per-group rule above cannot see: it pins only
// the orthogonal surround of a group, so two groups meeting corner to corner
// would slip through. Two diagonally adjacent wall cells must lie in one group,
// and inside a four-cell group the only orthogonal route between them is
// through one of the two cells completing their 2x2 block (going round the
// outside needs five cells), so one of those two is a wall as well.
const diagonalSeparation = diagonalPairs.map(([a, b, viaA, viaB]) => new Or([
  isLab(a), isLab(b), isWall(viaA), isWall(viaB),
]));

const framedX = [
  ['R2C2', 'R2C3'],
  ['R2C8', 'R3C8'],
  ['R4C4', 'R5C4'],
  ['R6C2', 'R6C3'],
  ['R6C5', 'R7C5'],
];
const plainX = [
  ['R1C7', 'R2C7'],
  ['R2C1', 'R3C1'],
  ['R5C6', 'R5C7'],
  ['R5C7', 'R6C7'],
  ['R6C3', 'R7C3'],
  ['R7C5', 'R7C6'],
  ['R8C4', 'R8C5'],
  ['R8C6', 'R9C6'],
  ['R8C8', 'R8C9'],
  ['R9C1', 'R9C2'],
];
const allX = [...framedX, ...plainX];

// Edges carrying no X: their digits must not sum to 10. Stamped from one
// template per edge direction onto the edges left unmarked, addressed by the
// upper/left cell of the pair.
const notTen = Pair.fnToKey((a, b) => a + b !== 10, graph.gridGeometry());
const edgeKey = (a, b) => [readingIndex(a), readingIndex(b)].sort((x, y) => x - y).join();
const markedEdges = new Set(allX.map(([a, b]) => edgeKey(a, b)));
const unmarkedEdgeStarts = (dRow, dCol) => cells.filter((cell) => {
  const next = graph.step(cell, dRow, dCol);
  return next !== null && !markedEdges.has(edgeKey(cell, next));
});
const noTenPairs = [
  graph.makeReplicate(
    new Pair(notTen, 'no X', 'R1C1', 'R1C2'), unmarkedEdgeStarts(0, 1)),
  graph.makeReplicate(
    new Pair(notTen, 'no X', 'R1C1', 'R2C1'), unmarkedEdgeStarts(1, 0)),
];

return [
  new Shape('9x9'),
  wall.toVar('labyrinth/wall'),
  wall.makeReplicate(new Given(wall.at('R1C1'), LAB, WALL)),

  new Given('R3C9', 9),

  new ConnectedValues('VW', LAB),
  ...blocks2x2.map((block) => new Or(block.map(isWall))),
  // At least two of the cell's orthogonal neighbours are labyrinth cells.
  ...cells.map((cell) => new Or([
    isWall(cell),
    new ContainAtLeast([LAB, LAB].join('_'), ...wall.at(graph.neighbours(cell))),
  ])),
  ...wallGroups,
  ...diagonalSeparation,

  ...allX.map(([a, b]) => new X(a, b)),
  ...noTenPairs,
  ...framedX.map(([a, b]) => new SameValues(2, wall.at(a), wall.at(b))),
  ...plainX.map(([a, b]) => new AllDifferent(wall.at(a), wall.at(b))),
];
