// Title: Serpent with a lisp
// Author: Lutterot
// Video: https://www.youtube.com/watch?v=Ti7uu3jCNw0
// Source: https://sudokupad.app/czjmyqmipr

// Snake membership is stored in VS1..VS81: 1 = on the snake, 2 = off.
// The degree rules and ConnectedValues make the selected cells one simple path
// whose two endpoints are the grey circles. Since every orthogonal adjacency
// between selected cells is an edge of that path, no non-consecutive parts can
// touch orthogonally.

const ON = 1;
const OFF = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const snake = graph.makeOverlay('VS');
const gridCells = graph.cells();

const greyCircles = ['R3C6', 'R6C5'];
const greySet = new Set(greyCircles);
const whiteCircles = [
  'R2C4', 'R4C2', 'R5C8', 'R6C3', 'R8C8', 'R9C5', 'R9C8',
];

const membership = [
  snake.makeReplicate(new Given(snake.cells()[0], ON, OFF)),
  ...snake.at(greyCircles).map(cell => new Given(cell, ON)),
  ...snake.at(whiteCircles).map(cell => new Given(cell, OFF)),
];

// An on-snake grey cell has degree 1; every other on-snake cell has degree 2.
// Off-snake cells impose no degree condition.
const makeDegreeMachine = targetDegree => NFA.encodeSpec({
  startState: { phase: 'center' },
  transition: ({ phase, count }, value) => {
    if (phase === 'center') {
      return value === ON
        ? { phase: 'neighbours', count: 0 }
        : { phase: 'off' };
    }
    if (phase === 'off') return { phase: 'off' };
    const next = count + (value === ON ? 1 : 0);
    return next <= targetDegree
      ? { phase: 'neighbours', count: next }
      : undefined;
  },
  accept: ({ phase, count }) =>
    phase === 'off' || (phase === 'neighbours' && count === targetDegree),
}, geometry.numValues);

const endpointDegreeMachine = makeDegreeMachine(1);
const pathDegreeMachine = makeDegreeMachine(2);
const degrees = gridCells.map(cell => new NFA(
  greySet.has(cell) ? endpointDegreeMachine : pathDegreeMachine,
  'snake-degree',
  ...snake.at([cell, ...graph.neighbours(cell)]),
));

// If an on-snake cell is an endpoint or a bend, its digit must be 1 or 9.
// Neighbours are read in the fixed order up, right, down, left, omitting steps
// outside the grid; their direction labels are retained in the machine state.
const directions = [
  ['U', -1, 0],
  ['R', 0, 1],
  ['D', 1, 0],
  ['L', 0, -1],
];
const opposite = directions =>
  directions.length === 2 &&
  ((directions.includes('U') && directions.includes('D')) ||
   (directions.includes('L') && directions.includes('R')));
const bendMachineCache = new Map();
const bendMachine = directionNames => {
  const key = directionNames.join('');
  if (!bendMachineCache.has(key)) {
    bendMachineCache.set(key, NFA.encodeSpec({
      startState: { phase: 'membership' },
      transition: (state, value) => {
        if (state.phase === 'membership') {
          return value === ON
            ? { phase: 'digit' }
            : { phase: 'off' };
        }
        if (state.phase === 'off') return { phase: 'off' };
        if (state.phase === 'digit') {
          return { phase: 'neighbours', digit: value, index: 0, on: [] };
        }
        const on = value === ON
          ? [...state.on, directionNames[state.index]]
          : state.on;
        return {
          phase: 'neighbours',
          digit: state.digit,
          index: state.index + 1,
          on,
        };
      },
      accept: state => {
        if (state.phase === 'off') return true;
        if (state.phase !== 'neighbours') return false;
        return opposite(state.on) || state.digit === 1 || state.digit === 9;
      },
      maxDepth: 2 + directionNames.length,
    }, geometry.numValues));
  }
  return bendMachineCache.get(key);
};

const bendDigits = gridCells.map(cell => {
  const directionalSteps = directions
    .map(([name, dRow, dCol]) => [name, graph.step(cell, dRow, dCol)])
    .filter(([, target]) => target);
  return new NFA(
    bendMachine(directionalSteps.map(([name]) => name)),
    'bend-digit',
    snake.at(cell),
    cell,
    ...snake.at(directionalSteps.map(([, target]) => target)),
  );
});

// Every three consecutive selected cells in a row or column must be strictly
// monotone. Together with the 1/9 bend and endpoint rule, this makes every
// maximal straight part a thermometer running from 1 to 9.
const monotoneTripleMachine = NFA.encodeSpec({
  startState: { phase: 'aMembership' },
  transition: (state, value) => {
    switch (state.phase) {
      case 'aMembership':
        return value === ON ? { phase: 'aDigit' } : { phase: 'skip', left: 5 };
      case 'aDigit':
        return { phase: 'bMembership', a: value };
      case 'bMembership':
        return value === ON
          ? { phase: 'bDigit', a: state.a }
          : { phase: 'skip', left: 3 };
      case 'bDigit':
        return { phase: 'cMembership', a: state.a, b: value };
      case 'cMembership':
        return value === ON
          ? { phase: 'cDigit', a: state.a, b: state.b }
          : { phase: 'skip', left: 1 };
      case 'cDigit':
        return (state.a < state.b && state.b < value) ||
          (state.a > state.b && state.b > value)
          ? { phase: 'done' }
          : undefined;
      case 'skip':
        return state.left > 1
          ? { phase: 'skip', left: state.left - 1 }
          : { phase: 'done' };
      case 'done':
        return { phase: 'done' };
    }
  },
  accept: ({ phase }) => phase === 'done',
}, geometry.numValues);

const straightTriples = gridCells.flatMap(cell => [[0, 1], [1, 0]]
  .map(([dRow, dCol]) => [
    cell,
    graph.step(cell, dRow, dCol),
    graph.step(cell, 2 * dRow, 2 * dCol),
  ])
  .filter(cells => cells.every(Boolean))
  .map(cells => new NFA(
    monotoneTripleMachine,
    'straight-thermo',
    ...cells.flatMap(pathCell => [snake.at(pathCell), pathCell]),
  )));

// Each box contains at least one snake cell.
const boxVisitMachine = NFA.encodeSpec({
  startState: { seen: false },
  transition: ({ seen }, value) => ({ seen: seen || value === ON }),
  accept: ({ seen }) => seen,
}, geometry.numValues);
const boxVisits = graph.boxes().map(box => new NFA(
  boxVisitMachine,
  'box-visit',
  ...snake.at(box),
));

// A white circle's digit equals its number of king-neighbour snake cells.
const circleCountMachine = NFA.encodeSpec({
  startState: { phase: 'target' },
  transition: (state, value) => {
    if (state.phase === 'target') {
      return { phase: 'count', target: value, count: 0 };
    }
    const count = state.count + (value === ON ? 1 : 0);
    return count <= state.target
      ? { phase: 'count', target: state.target, count }
      : undefined;
  },
  accept: ({ phase, target, count }) =>
    phase === 'count' && count === target,
}, geometry.numValues);
const circleCounts = whiteCircles.map(cell => new NFA(
  circleCountMachine,
  'circle-count',
  cell,
  ...snake.at(graph.kingNeighbours(cell)),
));

return [
  new Shape('9x9'),
  new Given('R3C6', 9),
  new Given('R7C1', 1),
  new Given('R9C9', 4),
  snake.toVar('snake membership'),
  ...membership,
  new ConnectedValues('VS', ON),
  ...degrees,
  ...bendDigits,
  ...straightTriples,
  ...boxVisits,
  new AllDifferent(...whiteCircles),
  ...circleCounts,
];
