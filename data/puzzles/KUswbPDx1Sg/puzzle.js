// Title: Lupin's Loop 1 - No Shared Factors
// Author: Rab3aron
// Video: https://www.youtube.com/watch?v=KUswbPDx1Sg
// Source: https://sudokupad.app/3p3nivu3o6
//
// Normal sudoku rules apply. Draw a single road (loop) that travels
// orthogonally from cell to cell, never branching, crossing, or overlapping,
// and which eventually closes into a loop. The road must pass through every
// house (an 11-cell subset of the grid). Borders marked with traffic lights
// are controlled intersections the road cannot cross.
//
// Encoded here: loop membership as a Var per cell (ON/OFF), degree-2 plus
// global connectivity for on-loop cells (together forcing a single simple
// cycle), houses forced onto the loop, traffic-light borders forbidden as
// loop edges, and the speed-camera row-count clues.
//
// Not encoded: the box-segment pairwise-prime rule, and the house digit =
// containing-segment-length rule (and its length-1-segment-is-1 corollary).

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);

const gridCells = graph.cells();

const houses = [
  'R9C1', 'R9C6', 'R7C5', 'R8C3', 'R5C6',
  'R1C7', 'R2C5', 'R1C4', 'R2C1', 'R3C2', 'R5C1',
];
const cameras = ['R3C7', 'R5C9'];
const trafficLightEdges = [
  ['R5C6', 'R5C7'],
  ['R3C9', 'R4C9'],
  ['R5C2', 'R6C2'],
];

// --- Houses are on the loop. ---
const housesOnLoop = houses.map(cell => new Given(loopCell(cell), ON));

// --- Single connected region: the on-loop cells form one connected blob.
// Combined with the degree-2 NFA below (every on-loop cell has exactly two
// on-loop orthogonal neighbours), this forces the on-loop cells to form a
// single simple cycle -- a connected graph that is 2-regular everywhere
// cannot be two or more disjoint cycles.
const connectedRegion = [new ConnectedValues('VL', ON)];

// --- Degree 2 for on-loop cells; off cells are unconstrained. ---
const degreeMachine = NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: ({ phase, onNeighbours }, membership) => {
    if (phase === 'start') {
      return membership === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const count = onNeighbours + (membership === ON ? 1 : 0);
    return count > 2 ? undefined : { phase: 'on', onNeighbours: count };
  },
  accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === 2,
}, geometry.numValues);
const degreeConstraints = gridCells.map(cell =>
  new NFA(degreeMachine, 'degree',
    loopCell(cell), ...loop.at(graph.neighbours(cell))));

// --- Traffic-light borders: the road cannot cross that edge, i.e. the two
// cells either side of it cannot both be on the loop (since, under degree-2,
// any orthogonally-adjacent on-on pair is necessarily a used loop edge).
const noCrossKey = Pair.fnToKey((a, b) => !(a === ON && b === ON), geometry.numValues);
const trafficLightConstraints = trafficLightEdges.map(([a, b]) =>
  new Pair(noCrossKey, 'no-cross', loopCell(a), loopCell(b)));

// --- Speed cameras: the camera cell's digit equals the number of on-loop
// cells in its entire row, including the camera cell itself.
const cameraMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : { target, count: next };
  },
  accept: ({ target, count }) => target !== null && count === target,
}, geometry.numValues);
const cameraConstraints = cameras.map(cell => {
  const { row } = parseCellId(cell);
  const rowCells = [];
  for (let col = 1; col <= 9; col++) rowCells.push(makeCellId(row, col));
  return new NFA(cameraMachine, 'camera-row', cell, ...loop.at(rowCells));
});

return [
  new Shape('9x9'),
  loop.toVar('loop'),
  ...housesOnLoop,
  ...connectedRegion,
  ...degreeConstraints,
  ...trafficLightConstraints,
  ...cameraConstraints,
];
