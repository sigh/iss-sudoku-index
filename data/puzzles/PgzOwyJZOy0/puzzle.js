// Title: Beyond
// Author: MaizeGator
// Video: https://www.youtube.com/watch?v=PgzOwyJZOy0
// Source: https://sudokupad.app/kfzjh67o5i

// Partial encoding. The water topology, clue-cell shading, and arrow counts are
// represented. ISS cannot currently constrain sums, sizes, or distinct digits
// separately within each solver-discovered island.

const WATER = 1;
const LAND = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('VS');
const gridCells = graph.cells();

// Every cell is either water or land.
const firstShade = shade.cells()[0];
const shadeDomain = shade.makeReplicate(
  new Given(firstShade, WATER, LAND));

// No 2x2 block may be entirely water.
const noWater2x2Machine = NFA.encodeSpec({
  startState: { values: [] },
  transition: ({ values, done }, value) => {
    if (done === true) return { done: true };
    const next = [...values, value];
    if (next.length < 4) return { values: next };
    return next.every(v => v === WATER) ? undefined : { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);
const blockOrigins = gridCells.filter(cell => graph.block(cell, 2, 2));
const noWater2x2 = shade.makeReplicate(
  new NFA(
    noWater2x2Machine,
    'no-water-2x2',
    ...shade.at(graph.block(gridCells[0], 2, 2))),
  shade.at(blockOrigins));

// Each numbered clue lies on land, including a question-mark clue.
const islandClues = [
  'R1C3', 'R1C7', 'R3C2', 'R3C5', 'R3C8',
  'R5C3', 'R5C7', 'R9C3', 'R9C7',
];
const clueLand = islandClues.map(
  cell => new Given(shade.at(cell), LAND));

const N = [-1, 0];
const NE = [-1, 1];
const E = [0, 1];
const SE = [1, 1];
const S = [1, 0];
const SW = [1, -1];
const W = [0, -1];
const NW = [-1, -1];

const arrows = {
  R1C1: [E],
  R2C2: [SE],
  R2C9: [W, SW],
  R3C1: [N, SE],
  R4C9: [W, SW],
  R6C5: [N, NW, W, E, SE],
  R7C3: [N, E, S, SW],
  R7C7: [W, S],
  R9C1: [NE],
};

// The origin digit is the quota; land cells on all indicated rays contribute
// one each. Segment breaks separate rays but do not reset the shared count.
const arrowCountMachine = NFA.encodeSpec({
  startState: { quota: null, count: 0 },
  transition: ({ quota, count }, value) => {
    if (value === SEGMENT_BREAK) return { quota, count };
    if (quota === null) return { quota: value, count };
    const next = count + (value === LAND ? 1 : 0);
    return next > quota ? undefined : { quota, count: next };
  },
  accept: ({ quota, count }) => quota !== null && count === quota,
}, geometry.numValues, { multiSegment: true });

const arrowCounts = Object.entries(arrows).map(([origin, directions]) =>
  new NFA(
    arrowCountMachine,
    'land-count',
    [origin],
    ...directions.map(direction =>
      shade.at(graph.ray(origin, ...direction).slice(1)))));

return [
  new Shape('9x9'),
  shade.toVar('water or land'),
  shadeDomain,
  new ConnectedValues('VS', WATER),
  noWater2x2,
  ...clueLand,
  ...arrowCounts,
];
