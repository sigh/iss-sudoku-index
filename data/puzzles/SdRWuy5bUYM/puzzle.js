// Title: The buried clue walls
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=SdRWuy5bUYM
// Source: https://sudokupad.app/hxw93rhz53

// Normal sudoku. A binary overlay records labyrinth (1) and wall (2) cells.
// The labyrinth is connected, no 2x2 is monochrome, and the four arrows are
// exactly its dead ends. Selected placements form an exact cover of the wall
// cells by isolated tetrominoes; every selected tetromino is a 12-cage.

const LABYRINTH = 1;
const WALL = 2;
const NOT_SELECTED = 1;
const SELECTED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const shade = graph.makeOverlay('VS');

const givens = [
  ['R2C3', 1],
  ['R5C7', 2],
];

const whiteDots = [
  ['R1C5', 'R2C5'],
  ['R2C2', 'R3C2'],
  ['R3C9', 'R4C9'],
  ['R4C6', 'R5C6'],
  ['R5C3', 'R6C3'],
  ['R5C8', 'R5C9'],
  ['R6C4', 'R7C4'],
  ['R6C6', 'R7C6'],
  ['R7C4', 'R7C5'],
  ['R8C5', 'R9C5'],
];

const xClues = [
  ['R4C1', 'R4C2'],
  ['R5C5', 'R6C5'],
];

const arrows = [
  ['R9C1', 'R9C2'],
  ['R9C4', 'R9C5'],
  ['R9C6', 'R9C5'],
  ['R9C9', 'R9C8'],
];
const arrowCells = new Set(arrows.map(([cell]) => cell));
const forcedLabyrinth = new Set(arrows.flatMap(([cell, pointedTo]) => [cell, pointedTo]));
const forcedWall = new Set(arrows.flatMap(([cell, pointedTo]) =>
  graph.neighbours(cell).filter(neighbour => neighbour !== pointedTo)));

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], LABYRINTH, WALL));

// No 2x2 block is entirely labyrinth or entirely wall.
const noMono2x2Machine = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values, done }, value) => {
    if (done) return { done: true };
    const next = [...values, value];
    if (next.length < 4) return { values: next };
    return next.every(v => v === next[0]) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noMono2x2 = shade.makeReplicate(
  new NFA(noMono2x2Machine, 'mixed 2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Every non-arrow labyrinth cell has a degree other than one. Connectivity and
// the given arrow cells rule out degree zero, so the arrows are all dead ends.
const nonArrowDegreeMachine = NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: ({ phase, count }, value) => {
    if (phase === 'center') {
      return value === WALL
        ? { phase: 'wall' }
        : { phase: 'labyrinth', count: 0 };
    }
    if (phase === 'wall') return { phase: 'wall' };
    return {
      phase: 'labyrinth',
      count: Math.min(2, count + (value === LABYRINTH ? 1 : 0)),
    };
  },
  accept: ({ phase, count }) => phase === 'wall' || count !== 1,
}, geometry.numValues);
const nonArrowDegrees = gridCells
  .filter(cell => !arrowCells.has(cell))
  .map(cell => new NFA(nonArrowDegreeMachine, 'not a dead end',
    ...shade.at([cell, ...graph.neighbours(cell)])));

// The arrow cell and its pointed-to neighbour are labyrinth; every other
// orthogonal neighbour of the arrow cell is a wall.
const arrowRules = arrows.flatMap(([cell, pointedTo]) => [
  new Given(shade.at(cell), LABYRINTH),
  new Given(shade.at(pointedTo), LABYRINTH),
  ...graph.neighbours(cell)
    .filter(neighbour => neighbour !== pointedTo)
    .map(neighbour => new Given(shade.at(neighbour), WALL)),
]);

// Generate the 19 fixed tetromino orientations from the five free tetrominoes.
const freeTetrominoes = [
  [[0, 0], [0, 1], [0, 2], [0, 3]],                    // I
  [[0, 0], [0, 1], [1, 0], [1, 1]],                    // O
  [[0, 0], [1, 0], [2, 0], [2, 1]],                    // L
  [[0, 0], [0, 1], [0, 2], [1, 1]],                    // T
  [[0, 0], [1, 0], [1, 1], [2, 1]],                    // S
];

const normalizeShape = cells => {
  const minRow = Math.min(...cells.map(([row]) => row));
  const minCol = Math.min(...cells.map(([, col]) => col));
  return cells
    .map(([row, col]) => [row - minRow, col - minCol])
    .sort(([r1, c1], [r2, c2]) => r1 - r2 || c1 - c2);
};
const shapeKey = cells => cells.map(([row, col]) => `${row},${col}`).join(';');
const fixedShapeMap = new Map();
for (const base of freeTetrominoes) {
  for (const reflected of [false, true]) {
    for (let rotation = 0; rotation < 4; rotation++) {
      const transformed = base.map(([row, col]) => {
        let r = row;
        let c = reflected ? -col : col;
        for (let turn = 0; turn < rotation; turn++) [r, c] = [c, -r];
        return [r, c];
      });
      const normalized = normalizeShape(transformed);
      fixedShapeMap.set(shapeKey(normalized), normalized);
    }
  }
}
const fixedShapes = [...fixedShapeMap.values()];

const allPlacements = fixedShapes.flatMap(shape => {
  const height = Math.max(...shape.map(([row]) => row)) + 1;
  const width = Math.max(...shape.map(([, col]) => col)) + 1;
  const result = [];
  for (let top = 1; top <= 10 - height; top++) {
    for (let left = 1; left <= 10 - width; left++) {
      const cells = shape.map(([row, col]) => makeCellId(top + row, left + col));
      const cellSet = new Set(cells);
      const boundary = [...new Set(cells.flatMap(cell => graph.kingNeighbours(cell)))]
        .filter(cell => !cellSet.has(cell));
      result.push({ cells, boundary });
    }
  }
  return result;
});
// Arrow implications eliminate impossible placements before selector Vars are
// allocated, keeping the generated model below ISS's 1000-cell limit.
const placements = allPlacements.filter(({ cells, boundary }) =>
  cells.every(cell => !forcedLabyrinth.has(cell)) &&
  boundary.every(cell => !forcedWall.has(cell)));

// One binary selection Var per possible placement. For each grid cell, an
// exact-cover sum equates wall membership with exactly one selected placement
// containing that cell. An active placement forces its four wall cells, a
// labyrinth king-neighbour boundary, and distinct digits summing to 12.
const placementVars = new Var('T', 'tetromino placements', placements.length);
const placementCells = placementVars.cells();
const placementsByCell = new Map(gridCells.map(cell => [cell, []]));
placements.forEach(({ cells }, index) => {
  for (const cell of cells) placementsByCell.get(cell).push(index);
});
const exactCover = gridCells
  .filter(cell => !forcedLabyrinth.has(cell))
  .map(cell => {
  const candidates = placementsByCell.get(cell).map(index => placementCells[index]);
  if (candidates.length === 1) {
    return new SameValues(2, candidates[0], shade.at(cell));
  }
  return new Sum(candidates.length - 1,
    ...candidates, [shade.at(cell), -1]);
  });
const placementRules = placements.map(({ cells, boundary }, index) => new Or([
  new Given(placementCells[index], NOT_SELECTED),
  new And([
    new Given(placementCells[index], SELECTED),
    ...shade.at(cells).map(cell => new Given(cell, WALL)),
    ...shade.at(boundary).map(cell => new Given(cell, LABYRINTH)),
    new Cage(12, ...cells),
  ]),
]));

const dots = whiteDots.map(([a, b]) => new WhiteDot(a, b));
const xs = xClues.flatMap(([a, b]) => [
  new X(a, b),
  new AllDifferent(...shade.at([a, b])),
]);

return [
  new Shape('9x9'),
  shade.toVar('labyrinth / wall'),
  placementVars,
  ...givens.map(([cell, value]) => new Given(cell, value)),
  shadeDomain,
  new ConnectedValues('VS', LABYRINTH),
  noMono2x2,
  ...nonArrowDegrees,
  ...arrowRules,
  ...exactCover,
  ...placementRules,
  ...dots,
  ...xs,
];
