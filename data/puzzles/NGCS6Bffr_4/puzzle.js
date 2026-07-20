// Title: Under The Microscope
// Author: gdc
// Video: https://www.youtube.com/watch?v=NGCS6Bffr_4
// Source: https://sudokupad.app/qqfj59akio

// Infection is represented by a parallel Var layer: 1 is infected and 2 is
// uninfected. Local state machines encode spreading and traceability. The
// per-component edge-touching cave rule is not represented.

const INFECTED = 1;
const UNINFECTED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const infection = graph.makeOverlay('VI');
const gridCells = graph.cells();

const firstInfection = infection.cells()[0];
const infectionDomain = infection.makeReplicate(
  new Given(firstInfection, INFECTED, UNINFECTED));

function boxNumber(cell) {
  const {row, col} = parseCellId(cell);
  return 3 * Math.floor((row - 1) / 3) + Math.floor((col - 1) / 3) + 1;
}

// Each row and column contains a digit matching that cell's box number.
function containsInoculationSite(cells) {
  return new Or(cells.map(cell => new Given(cell, boxNumber(cell))));
}
const inoculationDistribution = [
  ...Array.from({length: 9}, (_, index) =>
    containsInoculationSite(graph.row(index + 1))),
  ...Array.from({length: 9}, (_, index) =>
    containsInoculationSite(graph.column(index + 1))),
];

// Across an orthogonal edge, an infected larger digit forces the smaller digit
// to be infected. Applying this in both directions implements infection spread.
const spreadMachine = NFA.encodeSpec({
  startState: {phase: 'aStatus'},
  transition: (state, value) => {
    switch (state.phase) {
      case 'aStatus':
        return {phase: 'aDigit', aStatus: value};
      case 'aDigit':
        return {phase: 'bStatus', aStatus: state.aStatus, aDigit: value};
      case 'bStatus':
        return {
          phase: 'bDigit',
          aStatus: state.aStatus,
          aDigit: state.aDigit,
          bStatus: value,
        };
      case 'bDigit': {
        const aForcesB = state.aStatus === INFECTED && value < state.aDigit;
        const bForcesA = state.bStatus === INFECTED && state.aDigit < value;
        if (aForcesB && state.bStatus !== INFECTED) return undefined;
        if (bForcesA && state.aStatus !== INFECTED) return undefined;
        return {phase: 'done'};
      }
      case 'done':
        return {phase: 'done'};
    }
  },
  accept: ({phase}) => phase === 'done',
}, geometry.numValues);

const spreading = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => graph.step(cell, dRow, dCol))
  .filter(Boolean)
  .map(other => new NFA(
    spreadMachine,
    'infection-spread',
    infection.at(cell), cell, infection.at(other), other,
  )));

// A matching box digit is infected. Every other infected cell must have an
// infected, larger orthogonal neighbour. Following those strictly increasing
// steps must terminate at an inoculation site, proving traceability without a
// separate global reachability primitive.
function traceMachine(siteDigit) {
  return NFA.encodeSpec({
    startState: {phase: 'status'},
    transition: (state, value) => {
      switch (state.phase) {
        case 'status':
          if (value !== INFECTED && value !== UNINFECTED) return undefined;
          return {phase: 'digit', status: value};
        case 'digit':
          if (state.status === UNINFECTED && value === siteDigit) return undefined;
          return {
            phase: 'neighbourStatus',
            status: state.status,
            digit: value,
            traced: state.status === UNINFECTED || value === siteDigit,
          };
        case 'neighbourStatus':
          return {...state, phase: 'neighbourDigit', neighbourStatus: value};
        case 'neighbourDigit':
          return {
            ...state,
            phase: 'neighbourStatus',
            traced: state.traced ||
              (state.neighbourStatus === INFECTED && value > state.digit),
          };
      }
    },
    accept: ({phase, traced}) => phase === 'neighbourStatus' && traced === true,
  }, geometry.numValues);
}

const traceMachines = Array.from({length: 9}, (_, index) => traceMachine(index + 1));
const traceability = gridCells.map(cell => new NFA(
  traceMachines[boxNumber(cell) - 1],
  'infection-trace',
  infection.at(cell), cell,
  ...graph.neighbours(cell).flatMap(neighbour => [infection.at(neighbour), neighbour]),
));

const detectors = ['R3C5', 'R4C3', 'R5C3', 'R5C6', 'R8C8'];
const detectorCountMachine = NFA.encodeSpec({
  startState: {phase: 'target'},
  transition: (state, value) => {
    if (state.phase === 'target') return {phase: 'count', target: value, count: 0};
    const count = state.count + (value === INFECTED ? 1 : 0);
    return count > state.target
      ? undefined
      : {phase: 'count', target: state.target, count};
  },
  accept: ({phase, target, count}) => phase === 'count' && count === target,
}, geometry.numValues);
const detectorRules = detectors.flatMap(cell => [
  new Given(infection.at(cell), UNINFECTED),
  new NFA(
    detectorCountMachine,
    'detector-count',
    cell,
    ...infection.at(graph.kingNeighbours(cell)),
  ),
]);

const germyWhispers = [
  ['R8C1', 'R7C2'],
  ['R5C4', 'R4C5'],
  ['R4C8', 'R5C9'],
  ['R8C6', 'R7C5'],
];
const whisperRules = germyWhispers.flatMap(cells => [
  new Whisper(5, ...cells),
  ...infection.at(cells).map(cell => new Given(cell, INFECTED)),
]);

const cocciDots = [
  ['R2C2', 'R2C3'],
  ['R4C6', 'R4C7'],
  ['R8C7', 'R8C8'],
];
const cocciRules = cocciDots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new Given(infection.at(a), UNINFECTED),
  new Given(infection.at(b), UNINFECTED),
]);

return [
  new Shape('9x9'),
  infection.toVar('infection state'),
  infectionDomain,
  ...inoculationDistribution,
  ...spreading,
  ...traceability,
  // The uninfected cells form one orthogonally connected area.
  new ConnectedValues('VI', UNINFECTED),
  ...detectorRules,
  ...whisperRules,
  ...cocciRules,
];
