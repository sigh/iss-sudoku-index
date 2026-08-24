// Title: Frogger: The Sudoku
// Author: Ricky Cruz
// Video: https://www.youtube.com/watch?v=QR1-5Nfjs34
// Source: https://app.crackingthecryptic.com/sudoku/p27QN9Ldtj
//
// Standard sudoku, plus: an orthogonally-connected path starts at Frogger
// (R9C5), collects all 7 flies, and ends at one of five frog circles in row 1
// (R1C1/C3/C5/C7/C9). The path may not touch itself orthogonally (diagonal
// touches are explicitly allowed), and may not use the four bush cells in row
// 1. Frogger's start (row 9) is adjacent to the grey-shaded rows 6-8, and the
// blue-shaded rows 2-4 are adjacent to the row-1 frogs, so -- matching the
// classic Frogger board order start -> road -> river -> home, and grey
// asphalt vs. blue water -- rows 6-8 are the road and rows 2-4 are the river.
// In the road a horizontally-adjacent pair summing to 10 is a car and blocks
// both its cells; in the river a horizontally-adjacent pair summing to 10 is
// a log and is the ONLY kind of river cell the path may use.
//
// Path membership is a whole-grid Var overlay 'VP' (ON=1/OFF=2). Degree over
// orthogonal neighbours closes both the "single simple path" shape and the
// "no orthogonal self-touch" rule at once: capping a cell's on-neighbour count
// at its target (1 for the two endpoints, 2 elsewhere) forbids any extra
// touching neighbour, and ConnectedValues rules out extra disjoint pieces. A
// frog cell's only grid neighbour is the cell below it (its row-1 neighbours
// are bush cells, forced off), so any frog that ends up on the path is
// automatically the path's second endpoint -- no separate "exactly one frog"
// constraint is needed.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const path = graph.makeOverlay('VP');
const gridCells = graph.cells();

const start = 'R9C5';
// Fly markers (gold text overlays), from the payload's drawn geometry.
const flies = ['R3C4', 'R3C7', 'R5C3', 'R5C6', 'R5C9', 'R7C3', 'R9C8'];
// Bush cells (green 1x1 underlays), row 1.
const bushes = ['R1C2', 'R1C4', 'R1C6', 'R1C8'];
// Frog circles (row-1 underlay circles other than the bushes), candidate ends.
const frogs = ['R1C1', 'R1C3', 'R1C5', 'R1C7', 'R1C9'];

const rowCells = row => Array.from({ length: 9 }, (_, i) => makeCellId(row, i + 1));
const roadCells = [6, 7, 8].flatMap(rowCells);
const riverCells = [2, 3, 4].flatMap(rowCells);

// --- Path membership: every cell is on (1) or off (2); start/flies on, bushes off.
const originCell = path.cells()[0];
const membership = [
  path.makeReplicate(new Given(originCell, ON, OFF)),
  new Given(path.at(start), ON),
  ...path.at(flies).map(cell => new Given(cell, ON)),
  ...path.at(bushes).map(cell => new Given(cell, OFF)),
];

// --- Degree: on-cell orthogonal on-neighbour count equals a per-cell target.
// Off cells are unconstrained. Same construction as nordschleife.js's loop
// degree-2 NFA, parameterised by target so endpoints can be degree 1.
function buildDegreeMachine(target) {
  return NFA.encodeSpec({
    startState: { phase: 'start' },
    transition: ({ phase, onNeighbours }, membershipValue) => {
      if (phase === 'start') {
        return membershipValue === ON ? { phase: 'on', onNeighbours: 0 } : { phase: 'off' };
      }
      if (phase === 'off') return { phase: 'off' };
      const count = onNeighbours + (membershipValue === ON ? 1 : 0);
      return count > target ? undefined : { phase: 'on', onNeighbours: count };
    },
    accept: ({ phase, onNeighbours }) => phase === 'off' || onNeighbours === target,
  }, geometry.numValues);
}
const degreeEndpointMachine = buildDegreeMachine(1);
const degreeThroughMachine = buildDegreeMachine(2);

const endpointCells = [start, ...frogs];
const throughCells = gridCells.filter(cell => !endpointCells.includes(cell));
const degrees = [
  ...endpointCells.map(cell => new NFA(degreeEndpointMachine, 'degree-endpoint',
    ...path.at([cell, ...graph.neighbours(cell)]))),
  ...throughCells.map(cell => new NFA(degreeThroughMachine, 'degree-through',
    ...path.at([cell, ...graph.neighbours(cell)]))),
];

// --- Cars / logs: reads (membership, own digit, then each existing horizontal
// neighbour's digit) and decides whether the cell is part of a horizontally
// adjacent sum-10 pair. `accept` differs by region: the road forbids an on
// cell from being part of such a pair (a car blocks it), the river requires
// an on cell to be part of one (only logs are crossable).
function buildAdjacentSumMachine(accept) {
  return NFA.encodeSpec({
    startState: { phase: 'membership' },
    transition: (state, value) => {
      if (state.phase === 'membership') return { phase: 'digit', membershipValue: value };
      if (state.phase === 'digit') {
        return { phase: 'accum', membershipValue: state.membershipValue, ownDigit: value, isPair: false };
      }
      // phase === 'accum': value is a horizontal neighbour's digit.
      return { ...state, isPair: state.isPair || (state.ownDigit + value === 10) };
    },
    accept,
  }, geometry.numValues);
}
const carMachine = buildAdjacentSumMachine(
  ({ phase, membershipValue, isPair }) => phase === 'accum' && (membershipValue === OFF || !isPair));
const logMachine = buildAdjacentSumMachine(
  ({ phase, membershipValue, isPair }) => phase === 'accum' && (membershipValue === OFF || isPair));

const horizontalNeighbours = cell => [graph.step(cell, 0, -1), graph.step(cell, 0, 1)].filter(Boolean);
const cars = roadCells.map(cell => new NFA(carMachine, 'car', path.at(cell), cell, ...horizontalNeighbours(cell)));
const logs = riverCells.map(cell => new NFA(logMachine, 'log', path.at(cell), cell, ...horizontalNeighbours(cell)));

// Puzzle's own givens (payload digits; the pipeline does not auto-inject them).
const givens = [
  ['R1C2', 3], ['R1C8', 4], ['R2C3', 8], ['R2C5', 5], ['R2C7', 3],
  ['R4C1', 5], ['R4C5', 4], ['R4C9', 3], ['R5C2', 7], ['R5C5', 8], ['R5C8', 6],
  ['R6C2', 4], ['R6C8', 5], ['R7C2', 1], ['R7C5', 7], ['R7C8', 2],
  ['R8C1', 6], ['R8C4', 8], ['R8C6', 9], ['R8C9', 1], ['R9C1', 3], ['R9C9', 9],
].map(([cell, value]) => new Given(cell, value));

return [
  new Shape('9x9'),
  ...givens,
  path.toVar('path'),
  ...membership,
  new ConnectedValues('VP', ON),
  ...degrees,
  ...cars,
  ...logs,
];
