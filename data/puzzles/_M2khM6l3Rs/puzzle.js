// Title: How Far I'll Go
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=_M2khM6l3Rs
// Source: https://sudokupad.app/rj53fjf9jo

// Normal Sudoku, connected water, no all-water 2x2 blocks, and every drawn
// arrow's count of island cells on its indicated rays are encoded. Omitted:
// island partitioning, one clue per island, clue product totals, and
// within-island digit distinctness.

const WATER = 1;
const LAND = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

const shadeDomain = shade.makeReplicate(
  new Given(shade.cells()[0], WATER, LAND));

// This NFA scans a 2x2 terrain block and rejects the all-water pattern.
const noWater2x2Machine = NFA.encodeSpec({
  startState: { seen: [] },
  transition: ({ seen, done }, value) => {
    if (done === true) return { done: true };
    const next = [...seen, value];
    if (next.length < 4) return { seen: next };
    return next.every(v => v === WATER) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noWater2x2 = shade.makeReplicate(
  new NFA(noWater2x2Machine, 'no-water-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// A ray-count NFA tracks island cells up to its arrow digit. Each disjunct pins
// that digit and selects the matching terrain-count machine.
function exactLandCountMachine(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (count, value) => {
      const next = count + (value === LAND ? 1 : 0);
      return next <= target ? next : undefined;
    },
    accept: count => count === target,
  }, geometry.numValues);
}

function rayCells(cell, dr, dc) {
  const { row, col } = parseCellId(cell);
  const cells = [];
  for (let r = row + dr, c = col + dc;
       r >= 1 && r <= 9 && c >= 1 && c <= 9;
       r += dr, c += dc) {
    cells.push(makeCellId(r, c));
  }
  return cells;
}

const arrows = [
  ['R2C1', [[0, 1], [1, 1]]],
  ['R3C3', [[0, 1], [1, 0]]],
  ['R4C4', [[0, 1], [-1, 1]]],
  ['R4C8', [[-1, -1]]],
  ['R6C2', [[0, 1], [1, 0], [0, -1]]],
  ['R7C6', [[-1, 1]]],
  ['R8C8', [[0, 1], [0, -1]]],
  ['R9C8', [[0, -1]]],
  ['R9C9', [[0, -1], [-1, 0], [-1, -1]]],
];

const arrowCounts = arrows.map(([cell, directions]) => {
  const rays = directions.flatMap(([dr, dc]) => rayCells(cell, dr, dc));
  return new Or(Array.from({ length: 9 }, (_, index) => {
    const target = index + 1;
    return new And([
      new Given(cell, target),
      new NFA(exactLandCountMachine(target), `island-ray-count-${target}`,
        ...shade.at(rays)),
    ]);
  }));
});

return [
  new Shape('9x9'),
  shade.toVar('terrain'),
  shadeDomain,
  new ConnectedValues('VS', WATER),
  noWater2x2,
  ...arrowCounts,
];
