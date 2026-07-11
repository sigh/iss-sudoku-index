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
// Encoded here: loop membership as a Var per cell (ON/OFF), degree-2 for
// on-loop cells, houses forced onto the loop, traffic-light borders forbidden
// as loop edges, and the speed-camera row-count clues.
//
// Not encoded: global single-loop connectivity (only local degree-2 is
// enforced; disjoint sub-loops are not excluded), the box-segment
// pairwise-prime rule, and the house digit = containing-segment-length rule.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();

const loop = graph.makeOverlay('VL');
const loopCell = cell => loop.at(cell);

const gridCells = graph.cells();

const constraints = [new Shape('9x9'), loop.toVar('loop')];
const add = (...newConstraints) => constraints.push(...newConstraints);

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
for (const cell of houses) add(new Given(loopCell(cell), ON));

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
for (const cell of gridCells) {
  add(new NFA(degreeMachine, 'degree',
    loopCell(cell), ...graph.neighbours(cell).map(loopCell)));
}

// --- Traffic-light borders: the road cannot cross that edge, i.e. the two
// cells either side of it cannot both be on the loop (since, under degree-2,
// any orthogonally-adjacent on-on pair is necessarily a used loop edge).
const noCrossMachine = NFA.encodeSpec({
  startState: { phase: 'a' },
  transition: (state, value) => {
    if (state.phase === 'a') return { phase: 'b', aOn: value === ON };
    if (state.aOn && value === ON) return undefined;
    return { phase: 'done' };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
for (const [a, b] of trafficLightEdges) {
  add(new NFA(noCrossMachine, 'no-cross', loopCell(a), loopCell(b)));
}

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
for (const cell of cameras) {
  const { row } = parseCellId(cell);
  const rowCells = [];
  for (let col = 1; col <= 9; col++) rowCells.push(makeCellId(row, col));
  add(new NFA(cameraMachine, 'camera-row', cell, ...rowCells.map(loopCell)));
}

return constraints;
