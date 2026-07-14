// Title: Path of The Golden Bear
// Author: SuperSport
// Video: https://www.youtube.com/watch?v=KoMFWIJjtBc
// Source: https://sudokupad.app/90n1ck63vq

// The large yellow loop has a duplicate backing stroke but one semantic rule:
// region sum. The golden path is a solver-chosen ON/OFF overlay.

const ON = 1;
const OFF = 2;
const START = 'R3C8';
const END = 'R7C8';

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const path = graph.makeOverlay('VP');
const pathCell = cell => path.at(cell);

// The closed region-sum line has eight box-delimited segments. The first box's
// segment crosses the array boundary, so it is listed as one joined segment.
const regionSumSegments = [
  ['R3C2', 'R2C1', 'R1C2', 'R2C3'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R2C7', 'R1C8', 'R2C9', 'R3C8'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R7C9', 'R8C9', 'R9C8', 'R9C7'],
  ['R9C6', 'R9C5', 'R9C4'],
  ['R9C3', 'R9C2', 'R8C1', 'R7C1'],
  ['R6C1', 'R5C1', 'R4C1'],
];

const blueLines = [
  ['R4C2', 'R3C3', 'R4C4'],
  ['R4C6', 'R3C7', 'R4C8'],
  ['R7C7', 'R8C6', 'R8C5', 'R8C4'],
];

const brownLoop = ['R5C4', 'R5C5', 'R5C6', 'R6C5', 'R5C4'];
const parityKey = Pair.fnToKey((a, b) => (a & 1) !== (b & 1), geometry);

const blackDots = [
  ['R5C2', 'R6C2'], ['R5C8', 'R6C8'], ['R4C4', 'R4C5'],
];
const whiteDots = [
  ['R6C2', 'R6C3'], ['R6C8', 'R6C9'], ['R6C7', 'R6C8'],
  ['R6C1', 'R6C2'], ['R4C5', 'R5C5'], ['R4C5', 'R4C6'],
];
const xPairs = [
  ['R2C1', 'R2C2'], ['R2C8', 'R2C9'], ['R8C7', 'R9C7'],
];

// Every overlay cell is either on or off, and both white squares are endpoints.
const origin = path.cells()[0];
const membership = [
  path.makeReplicate(new Given(origin, ON, OFF)),
  new Given(pathCell(START), ON),
  new Given(pathCell(END), ON),
];

// Endpoints have one ON neighbour, internal path cells have two, and OFF cells
// have none as path edges. Connectivity then makes the ON cells one simple path.
const makeDegreeMachine = target => NFA.encodeSpec({
  startState: { phase: 'start', count: 0 },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return value === OFF ? { phase: 'off', count: 0 } : { phase: 'on', count: 0 };
    }
    if (state.phase === 'off') return state;
    const count = state.count + (value === ON ? 1 : 0);
    return count > target ? undefined : { phase: 'on', count };
  },
  accept: state => state.phase === 'off' || state.count === target,
  maxDepth: 5,
}, geometry.numValues);
const endpointDegreeMachine = makeDegreeMachine(1);
const internalDegreeMachine = makeDegreeMachine(2);
const degrees = gridCells.map(cell => {
  const machine = cell === START || cell === END
    ? endpointDegreeMachine : internalDegreeMachine;
  return new NFA(machine, 'path degree',
    pathCell(cell), ...graph.neighbours(cell).map(pathCell));
});

// Each visited box contains exactly three path cells; unvisited boxes contain 0.
const boxCountMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    const next = count + (value === ON ? 1 : 0);
    return next > 3 ? undefined : { count: next };
  },
  accept: ({ count }) => count === 0 || count === 3,
}, geometry.numValues);
const boxCounts = graph.boxes().map(box =>
  new NFA(boxCountMachine, 'path box count', ...box.map(pathCell)));

// For every internal path cell, its digit and the digits in its two ON
// neighbours occupy all three entropy bands. Endpoints have no centred triple.
const bandOf = digit => ((digit - 1) / 3) | 0;
const entropicMachine = NFA.encodeSpec({
  startState: { phase: 'ownMembership' },
  transition: (state, value) => {
    if (state.phase === 'ownMembership') {
      return value === ON ? { phase: 'ownDigit' } : { phase: 'off' };
    }
    if (state.phase === 'off') return state;
    if (state.phase === 'ownDigit') {
      return { phase: 'neighbourMembership', bands: 1 << bandOf(value), count: 0 };
    }
    if (state.phase === 'neighbourMembership') {
      return { ...state, phase: 'neighbourDigit', neighbourOn: value === ON };
    }
    return {
      phase: 'neighbourMembership',
      bands: state.neighbourOn ? state.bands | (1 << bandOf(value)) : state.bands,
      count: state.count + (state.neighbourOn ? 1 : 0),
    };
  },
  accept: state => state.phase === 'off' ||
    (state.phase === 'neighbourMembership' &&
      (state.count === 1 || (state.count === 2 && state.bands === 0b111))),
  maxDepth: 10,
}, geometry.numValues);
const pathEntropy = gridCells.map(cell => new NFA(entropicMachine, 'path entropy',
  pathCell(cell), cell,
  ...graph.neighbours(cell).flatMap(neighbour => [pathCell(neighbour), neighbour])));

// Scan membership/digit pairs in grid order and total only selected digits.
const pathSumMachine = NFA.encodeSpec({
  startState: { phase: 'membership', sum: 0 },
  transition: (state, value) => {
    if (state.phase === 'membership') {
      return { phase: 'digit', sum: state.sum, selected: value === ON };
    }
    const sum = state.sum + (state.selected ? value : 0);
    return sum > 110 ? undefined : { phase: 'membership', sum };
  },
  accept: state => state.phase === 'membership' && state.sum === 110,
  maxDepth: 162,
}, geometry.numValues);
const pathSum = new NFA(pathSumMachine, 'path sum 110',
  ...gridCells.flatMap(cell => [pathCell(cell), cell]));

return [
  new Shape('9x9'),
  path.toVar('golden path'),

  new EqualSum(...regionSumSegments),
  ...blueLines.map(line => new Modular(3, ...line)),
  new Pair(parityKey, 'parity loop', ...brownLoop),

  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...xPairs.map(([a, b]) => new X(a, b)),
  new V('R5C3', 'R6C3'),

  ...membership,
  new ConnectedValues('VP', ON),
  ...degrees,
  ...boxCounts,
  ...pathEntropy,
  pathSum,
];
