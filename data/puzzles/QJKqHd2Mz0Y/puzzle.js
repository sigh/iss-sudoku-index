// Title: Patient Zeroes
// Author: gdc
// Video: https://www.youtube.com/watch?v=QJKqHd2Mz0Y
// Source: https://sudokupad.app/27v1lv24c3

// Infection and path membership are parallel 1/2 overlays. Infection is exact:
// strict descent makes the local predecessor rule acyclic, so each infected cell
// traces back to a patient zero without a separate connectivity constraint.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const gridCells = graph.cells();
const infection = graph.makeOverlay('VI');
const path = graph.makeOverlay('VP');

const doctor = 'R5C4';
const hospital = 'R3C8';
const microscopes = [
  'R1C8', 'R2C6', 'R5C3', 'R5C7',
  'R6C8', 'R7C2', 'R8C4', 'R9C9',
];
const tablets = [
  ['R2C4', 'R2C5'],
  ['R4C5', 'R5C5'],
  ['R6C1', 'R6C2'],
  ['R7C9', 'R8C9'],
  ['R9C3', 'R9C4'],
];

const boxNumber = (cell) => {
  const {row, col} = parseCellId(cell);
  return 1 + Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3);
};

// Every row and column contains one of the nine patient zeroes. Each standard
// box already contains its own number exactly once, so existence in all nine
// rows/columns also makes the distribution one per row and column.
const patientZeroDistribution = [
  ...graph.rows(),
  ...graph.columns(),
].map(cells => new Or(cells.map(cell => new Given(cell, boxNumber(cell)))));

// Reads own infection flag and digit, then each orthogonal neighbour's flag and
// digit. A cell is infected exactly when it is a patient zero or has an infected
// larger neighbour. This simultaneously enforces spread and ancestry.
const infectionMachine = (patientDigit) => NFA.encodeSpec({
  startState: {phase: 'ownFlag'},
  transition: (state, value) => {
    switch (state.phase) {
      case 'ownFlag':
        return {phase: 'ownDigit', infected: value === ON};
      case 'ownDigit':
        return {
          phase: 'neighbourFlag',
          infected: state.infected,
          ownDigit: value,
          source: value === patientDigit,
        };
      case 'neighbourFlag':
        return {
          ...state,
          phase: 'neighbourDigit',
          neighbourInfected: value === ON,
        };
      case 'neighbourDigit':
        return {
          phase: 'neighbourFlag',
          infected: state.infected,
          ownDigit: state.ownDigit,
          source: state.source ||
            (state.neighbourInfected && value > state.ownDigit),
        };
    }
  },
  accept: ({phase, infected, source}) =>
    phase === 'neighbourFlag' && infected === source,
}, geometry.numValues);

const infections = gridCells.map(cell => {
  const scan = [cell, ...graph.neighbours(cell)]
    .flatMap(item => [infection.at(item), item]);
  return new NFA(infectionMachine(boxNumber(cell)), 'infection', ...scan);
});

// The endpoints have degree one, every other path cell degree two, and cells off
// the path are unconstrained by degree. The target is compiled into the machine.
const degreeFor = (target) => NFA.encodeSpec({
  startState: {phase: 'own'},
  transition: (state, value) => {
    if (state.phase === 'own') {
      return value === OFF
        ? {phase: 'off'}
        : {phase: 'neighbours', count: 0};
    }
    if (state.phase === 'off') return state;
    const count = state.count + (value === ON ? 1 : 0);
    return count > target ? undefined : {phase: 'neighbours', count};
  },
  accept: ({phase, count}) =>
    phase === 'off' || (phase === 'neighbours' && count === target),
}, geometry.numValues);
const exactPathDegrees = gridCells.map(cell => new NFA(
  degreeFor(cell === doctor || cell === hospital ? 1 : 2),
  'path degree', path.at(cell), ...path.at(graph.neighbours(cell)),
));

// No 2x2 block may contain only a diagonally touching pair of path cells.
const noDiagonalTouchMachine = NFA.encodeSpec({
  startState: {cells: []},
  transition: ({cells}, value) => {
    if (cells === null) return {cells: null};
    const next = [...cells, value === ON];
    if (next.length < 4) return {cells: next};
    const [a, b, c, d] = next;
    const diagonalOnly = (a && d && !b && !c) || (b && c && !a && !d);
    return diagonalOnly ? undefined : {cells: null};
  },
  accept: ({cells}) => cells === null,
}, geometry.numValues);
const noDiagonalOrigins = gridCells
  .filter(cell => graph.block(cell, 2, 2) !== null);
const noDiagonalTouches = path.makeReplicate(
  new NFA(noDiagonalTouchMachine, 'path no-touch',
    ...path.at(graph.block('R1C1', 2, 2))),
  path.at(noDiagonalOrigins),
);

// A path cell cannot be infected. One scan enforces the relation at all cells.
const pathSafetyMachine = NFA.encodeSpec({
  startState: {phase: 'path'},
  transition: (state, value) => {
    if (state.phase === 'path') {
      return {phase: 'infection', pathOn: value === ON};
    }
    if (state.pathOn && value === ON) return undefined;
    return {phase: 'path'};
  },
  accept: ({phase}) => phase === 'path',
}, geometry.numValues);
const pathSafety = new NFA(pathSafetyMachine, 'uninfected path',
  ...gridCells.flatMap(cell => [path.at(cell), infection.at(cell)]));

// A microscope digit counts infected cells in its clipped 3x3 neighbourhood.
// Its own cell is included by the stated "up to 9" convention; it contributes
// zero because every microscope is also on the uninfected path.
const microscopeMachine = NFA.encodeSpec({
  startState: {target: null, count: 0},
  transition: ({target, count}, value) => {
    if (target === null) return {target: value, count: 0};
    const next = count + (value === ON ? 1 : 0);
    return next > target ? undefined : {target, count: next};
  },
  accept: ({target, count}) => target !== null && target === count,
}, geometry.numValues);
const microscopeCounts = microscopes.map(cell => new NFA(
  microscopeMachine, 'microscope', cell,
  ...infection.at([cell, ...graph.kingNeighbours(cell)]),
));

const fixedMembership = [
  infection.makeReplicate(new Given(infection.cells()[0], ON, OFF)),
  path.makeReplicate(new Given(path.cells()[0], ON, OFF)),
  new Given(path.at(doctor), ON),
  new Given(path.at(hospital), ON),
  ...path.at(microscopes).map(cell => new Given(cell, ON)),
];

const kropkiTablets = tablets.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new Given(infection.at(a), OFF),
  new Given(infection.at(b), OFF),
]);

return [
  new Shape('9x9'),
  new Given('R1C1', 4),
  new Given('R3C7', 2),
  infection.toVar('infection'),
  path.toVar('path'),
  ...fixedMembership,
  ...patientZeroDistribution,
  ...infections,
  new ConnectedValues('VP', ON),
  ...exactPathDegrees,
  noDiagonalTouches,
  pathSafety,
  ...microscopeCounts,
  ...kropkiTablets,
];
