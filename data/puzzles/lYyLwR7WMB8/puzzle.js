// Title: The Secret
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=lYyLwR7WMB8
// Source: https://app.crackingthecryptic.com/sudoku/6nbn92B22p

// Normal Sudoku; each listed grey region sums to 45. Five differently labelled
// paths join the ten grey circles in pairs, avoid the grey cells, do not overlap,
// and each have digit sum 45. The listed white dots are consecutive; unlisted
// consecutive pairs are allowed. Labels are canonically ordered by first appearance.
const PATHS = [1, 2, 3, 4, 5];
const OFF = 6;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const path = graph.makeOverlay('VP');
const pathCells = path.cells();

const givens = [
  ['R2C8', 4], ['R2C9', 5], ['R5C3', 4],
  ['R5C7', 5], ['R9C1', 4], ['R9C4', 5],
].map(([cell, value]) => new Given(cell, value));

// The grey shading and circles drawn in the source payload.
const greyRegions = [
  ['R2C2', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R2C4', 'R3C4', 'R4C4',
    'R5C4', 'R6C4', 'R7C4', 'R8C4'],
  ['R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8', 'R5C7', 'R5C6',
    'R4C6', 'R3C6', 'R2C6', 'R2C7', 'R2C8'],
];
const grey = greyRegions.flat();
const circles = ['R7C1', 'R6C1', 'R1C2', 'R3C3', 'R1C6', 'R3C7', 'R4C7', 'R7C5', 'R9C6', 'R8C9'];
const circleSet = new Set(circles);

// A selected circle has one same-path neighbour; other selected cells have two.
const degreeMachine = (targetDegree) => NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: (state, value) => {
    if (state.phase === 'center') {
      return state.label === undefined
        ? { phase: 'neighbours', label: value, count: 0 }
        : undefined;
    }
    if (state.label === OFF) return state;
    const count = state.count + (value === state.label ? 1 : 0);
    return count > targetDegree ? undefined : { ...state, count };
  },
  accept: ({ label, count }) => label === OFF || count === targetDegree,
}, geometry.numValues);
const internalDegreeMachine = degreeMachine(2);
const endpointDegreeMachine = degreeMachine(1);
const degrees = gridCells.map(cell => new NFA(
  circleSet.has(cell) ? endpointDegreeMachine : internalDegreeMachine,
  circleSet.has(cell) ? 'circle endpoint' : 'path degree',
  ...path.at([cell, ...graph.neighbours(cell)]),
));

// Each label's selected digits are accumulated while reading (label, digit) pairs.
const sumMachine = (target) => NFA.encodeSpec({
  startState: { label: null, sum: 0 },
  transition: ({ label, sum }, value) => {
    if (label === null) return { label: value, sum };
    const next = sum + (label === target ? value : 0);
    return next > 45 ? undefined : { label: null, sum: next };
  },
  accept: ({ label, sum }) => label === null && sum === 45,
}, geometry.numValues);
const interleaved = gridCells.flatMap((cell, index) => [pathCells[index], cell]);
const pathSums = PATHS.map(label => new NFA(sumMachine(label), `path-${label}-sum`, ...interleaved));

// First-appearance order only removes the arbitrary names of the five colours.
const canonicalLabelsMachine = NFA.encodeSpec({
  startState: { largest: 0 },
  transition: ({ largest }, value) => {
    if (value === OFF || value <= largest) return { largest };
    return value === largest + 1 ? { largest: value } : undefined;
  },
  accept: ({ largest }) => largest === PATHS.length,
}, geometry.numValues);

const dots = [
  ['R2C8', 'R2C9'], ['R6C8', 'R7C8'], ['R6C5', 'R7C5'], ['R7C4', 'R8C4'],
  ['R5C4', 'R6C4'], ['R3C4', 'R4C4'], ['R2C4', 'R2C5'], ['R2C5', 'R2C6'],
  ['R4C5', 'R4C6'], ['R4C5', 'R5C5'], ['R4C6', 'R5C6'], ['R1C3', 'R2C3'],
  ['R1C1', 'R2C1'], ['R7C2', 'R7C3'], ['R7C3', 'R8C3'], ['R8C2', 'R8C3'],
  ['R8C2', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...givens,
  ...greyRegions.map(region => new Sum(45, ...region)),
  path.toVar('path labels'),
  path.makeReplicate(new Given(pathCells[0], ...PATHS, OFF)),
  ...path.at(grey).map(cell => new Given(cell, OFF)),
  ...path.at(circles).map(cell => new Given(cell, ...PATHS)),
  new NFA(canonicalLabelsMachine, 'canonical path labels', ...pathCells),
  ...PATHS.map(label => new ConnectedValues('VP', label)),
  ...degrees,
  ...pathSums,
  ...dots.map(pair => new WhiteDot(...pair)),
];
