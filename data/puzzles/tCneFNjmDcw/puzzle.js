// Title: Set Sail
// Author: Panda
// Video: https://www.youtube.com/watch?v=tCneFNjmDcw
// Source: https://sudokupad.app/ik85shpid7

// A route cell stores its outgoing direction. Order is a base-16 two-cell label;
// it rises on every route edge and resets only when the route re-enters the dock.
// Therefore every selected cell belongs to the one directed cycle through the dock.

const OFF = 1;
const DIRECTIONS = [
  { code: 2, dRow: -1, dCol: 1, name: 'NE' },
  { code: 3, dRow: 0, dCol: 1, name: 'E' },
  { code: 4, dRow: 1, dCol: 1, name: 'SE' },
  { code: 5, dRow: 1, dCol: 0, name: 'S' },
  { code: 6, dRow: 1, dCol: -1, name: 'SW' },
  { code: 7, dRow: 0, dCol: -1, name: 'W' },
  { code: 8, dRow: -1, dCol: -1, name: 'NW' },
];
const ROUTE_CODES = DIRECTIONS.map(({ code }) => code);
const ORDER_BASE = 16;

const shape = new Shape('9x9', ORDER_BASE);
const graph = cellGraph(shape);
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const route = graph.makeOverlay('VR');
const orderHigh = graph.makeOverlay('VH');
const orderLow = graph.makeOverlay('VL');

const dock = 'R5C6';
const ships = ['R2C4', 'R3C2', 'R6C2', 'R9C3', 'R8C7'];
const islands = [
  'R4C4', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R5C7',
  'R5C8', 'R6C5', 'R6C6', 'R6C7', 'R7C7',
];
const shallowGroups = [
  { total: 4, cells: ['R1C1', 'R2C1'] },
  { total: 16, cells: ['R1C9', 'R2C9', 'R2C8', 'R2C7'] },
  { total: 12, cells: ['R8C1', 'R9C1'] },
  { total: 12, cells: ['R8C5', 'R8C6'] },
  { total: 8, cells: ['R7C9', 'R8C9', 'R9C9'] },
  { total: null, cells: ['R2C5'] },
];
const shallowCells = shallowGroups.flatMap(({ cells }) => cells);
const blockedCells = [...islands, ...shallowCells];

// Widening supplies the two base-16 order digits. Restore the real grid domain,
// and restrict the route layer to OFF plus the seven legal (non-north) moves.
const gridDomain = graph.makeReplicate(new Given(gridCells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));
const routeDomain = route.makeReplicate(new Given(route.cells()[0], OFF, ...ROUTE_CODES));

const fixedMembership = [
  ...blockedCells.map(cell => new Given(route.at(cell), OFF)),
  ...[dock, ...ships].map(cell => new Given(route.at(cell), ...ROUTE_CODES)),
];

// A route cell cannot hold a kraken (3). OFF cells receive the canonical order
// 1:1 so unused order variables do not create spurious solver solutions.
const cellStateMachine = NFA.encodeSpec({
  startState: { phase: 'route' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'route':
        return { phase: 'digit', isOff: value === OFF };
      case 'digit':
        if (!state.isOff && value === 3) return undefined;
        return { phase: 'high', isOff: state.isOff };
      case 'high':
        if (state.isOff && value !== 1) return undefined;
        return { phase: 'low', isOff: state.isOff };
      case 'low':
        return state.isOff && value !== 1 ? undefined : { phase: 'done' };
      case 'done':
        return undefined;
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const cellStates = gridCells.map(cell => new NFA(
  cellStateMachine,
  'route cell',
  route.at(cell), cell, orderHigh.at(cell), orderLow.at(cell),
));

// Each route cell has exactly one predecessor; OFF cells have none. Combined
// with one outgoing direction per route cell, this forms one or more cycles.
// NFA specs cannot receive per-instance constants, so compile one predecessor
// counter for each distinct boundary layout.
const incomingByLayout = new Map();
const incomingConstraints = gridCells.map(cell => {
  const predecessors = DIRECTIONS
    .map(direction => {
      const predecessor = graph.step(cell, -direction.dRow, -direction.dCol);
      return predecessor && { predecessor, code: direction.code };
    })
    .filter(Boolean);
  const key = predecessors.map(({ code }) => code).join('_');
  if (!incomingByLayout.has(key)) {
    const expectedCodes = predecessors.map(({ code }) => code);
    incomingByLayout.set(key, NFA.encodeSpec({
      startState: { phase: 'self' },
      transition: (state, value) => {
        if (state.phase === 'self') {
          return {
            phase: 'incoming',
            needed: value === OFF ? 0 : 1,
            seen: 0,
            index: 0,
          };
        }
        const seen = state.seen + (value === expectedCodes[state.index] ? 1 : 0);
        if (seen > state.needed) return undefined;
        const index = state.index + 1;
        return index === expectedCodes.length
          ? { phase: 'done', valid: seen === state.needed }
          : { ...state, seen, index };
      },
      accept: ({ phase, valid }) => phase === 'done' && valid,
    }, geometry.numValues));
  }
  return new NFA(
    incomingByLayout.get(key),
    'one predecessor',
    route.at(cell),
    ...predecessors.map(({ predecessor }) => route.at(predecessor)),
  );
});

// Directions which would leave the grid are removed cell by cell.
const boundaryDirections = gridCells.map(cell => new Given(
  route.at(cell),
  OFF,
  ...DIRECTIONS.filter(({ dRow, dCol }) => graph.step(cell, dRow, dCol)).map(({ code }) => code),
));

// For each possible directed edge, enforce the order increment and the digit
// transition. Ships rise by exactly 3; ordinary destinations decrease; entry
// to the dock is the sole order reset and has no digit comparison.
function edgeMachine(directionCode, destinationKind) {
  return NFA.encodeSpec({
    startState: { phase: 'route' },
    transition: (state, value) => {
      switch (state.phase) {
        case 'route':
          return value === directionCode
            ? { phase: 'sourceHigh' }
            : { phase: 'skip', left: 6 };
        case 'skip':
          return state.left > 1
            ? { phase: 'skip', left: state.left - 1 }
            : { phase: 'done' };
        case 'sourceHigh':
          return { phase: 'sourceLow', sourceHigh: value };
        case 'sourceLow':
          return {
            phase: 'targetHigh',
            sourceHigh: state.sourceHigh,
            sourceLow: value,
          };
        case 'targetHigh': {
          if (destinationKind === 'dock') {
            return value === 1 ? { ...state, phase: 'targetLow' } : undefined;
          }
          const expectedHigh = state.sourceLow === ORDER_BASE
            ? state.sourceHigh + 1
            : state.sourceHigh;
          if (expectedHigh > ORDER_BASE || value !== expectedHigh) return undefined;
          return { ...state, phase: 'targetLow' };
        }
        case 'targetLow': {
          const expectedLow = destinationKind === 'dock'
            ? 1
            : state.sourceLow === ORDER_BASE ? 1 : state.sourceLow + 1;
          return value === expectedLow ? { phase: 'sourceDigit' } : undefined;
        }
        case 'sourceDigit':
          return { phase: 'targetDigit', sourceDigit: value };
        case 'targetDigit': {
          const valid = destinationKind === 'dock' ||
            (destinationKind === 'ship' ? value === state.sourceDigit + 3 : value < state.sourceDigit);
          return valid ? { phase: 'done' } : undefined;
        }
        case 'done':
          return undefined;
      }
    },
    accept: ({ phase }) => phase === 'done',
  }, geometry.numValues);
}

const edgeMachines = new Map();
const edgeConstraints = gridCells.flatMap(source => DIRECTIONS.flatMap(direction => {
  const target = graph.step(source, direction.dRow, direction.dCol);
  if (!target) return [];
  const destinationKind = target === dock ? 'dock' : ships.includes(target) ? 'ship' : 'ordinary';
  const key = `${direction.code}_${destinationKind}`;
  if (!edgeMachines.has(key)) {
    edgeMachines.set(key, edgeMachine(direction.code, destinationKind));
  }
  return [new NFA(
    edgeMachines.get(key),
    `route ${direction.name}`,
    route.at(source),
    orderHigh.at(source), orderLow.at(source),
    orderHigh.at(target), orderLow.at(target),
    source, target,
  )];
}));

// Two diagonals crossing through the centre of the same 2x2 would cross without
// sharing a cell. Reject any block using both diagonals in either orientation.
const noCrossMachine = NFA.encodeSpec({
  startState: { index: 0, mainDiagonal: false, antiDiagonal: false },
  transition: (state, value) => {
    if (state.index >= 4) return undefined;
    let mainDiagonal = state.mainDiagonal;
    let antiDiagonal = state.antiDiagonal;
    if (state.index === 0 && value === 4) mainDiagonal = true; // TL -> BR
    if (state.index === 3 && value === 8) mainDiagonal = true; // BR -> TL
    if (state.index === 1 && value === 6) antiDiagonal = true; // TR -> BL
    if (state.index === 2 && value === 2) antiDiagonal = true; // BL -> TR
    if (mainDiagonal && antiDiagonal) return undefined;
    const index = state.index + 1;
    return index === 4
      ? { phase: 'done' }
      : { index, mainDiagonal, antiDiagonal };
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);
const crossingStarts = gridCells.filter(cell => graph.block(cell, 2, 2));
const crossingOrigin = crossingStarts[0];
const noCrossings = route.makeReplicate(
  new NFA(noCrossMachine, 'no crossing', ...route.block(route.at(crossingOrigin), 2, 2)),
  route.at(crossingStarts),
);

const islandNoKraken = islands.map(cell => new Given(cell, 1, 2, 4, 5, 6, 7, 8, 9));
const shallowSums = shallowGroups
  .filter(({ total }) => total !== null)
  .map(({ total, cells }) => new Sum(total, ...cells));

return [
  shape,
  route.toVar('outgoing route direction'),
  orderHigh.toVar('route order high digit'),
  orderLow.toVar('route order low digit'),
  gridDomain,
  routeDomain,
  ...fixedMembership,
  new Given(orderHigh.at(dock), 1),
  new Given(orderLow.at(dock), 1),
  ...boundaryDirections,
  ...cellStates,
  ...incomingConstraints,
  ...edgeConstraints,
  noCrossings,
  ...islandNoKraken,
  ...shallowSums,
];
