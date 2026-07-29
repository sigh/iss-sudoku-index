// Title: Arctic Expedition
// Author: Cale Schoon
// Video: https://www.youtube.com/watch?v=lFskqPXX7zk
// Source: https://sudokupad.app/28k5j6fvfe

// Normal Sudoku with the four given digits. The expedition is a directed path
// from R2C2 to R9C9: each non-final cell exits to one orthogonal neighbour and
// each non-start cell has one incoming exit. The three residue layers advance
// on every exit; their 5, 7, and 8 periods have lcm 280, so an 81-cell route
// cannot contain a directed cycle. It is therefore one path through all cells.
const UP = 1, RIGHT = 2, DOWN = 3, LEFT = 4, END = 5;
const START = 'R2C2', FINISH = 'R9C9';
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const cells = graph.cells();
const exit = graph.makeOverlay('VE');
const pos5 = graph.makeOverlay('VP');
const pos7 = graph.makeOverlay('VQ');
const pos8 = graph.makeOverlay('VR');

const directionTo = (from, to) => {
  const a = parseCellId(from), b = parseCellId(to);
  if (b.row === a.row - 1) return UP;
  if (b.row === a.row + 1) return DOWN;
  if (b.col === a.col - 1) return LEFT;
  return RIGHT;
};
const pointsTo = (direction, from, to) => direction === directionTo(from, to);

// Direction domains name the drawn grid boundary: no route edge may leave it.
const exitDomains = cells.map(cell => {
  if (cell === FINISH) return new Given(exit.at(cell), END);
  const { row, col } = parseCellId(cell);
  const allowed = [UP, RIGHT, DOWN, LEFT].filter(direction =>
    !(direction === UP && row === 1) &&
    !(direction === RIGHT && col === geometry.numCols) &&
    !(direction === DOWN && row === geometry.numRows) &&
    !(direction === LEFT && col === 1));
  return new Given(exit.at(cell), ...allowed);
});

// Each cell other than Polly's start has exactly one incoming route edge; the
// start has none. This reads the exit code of each orthogonal neighbour.
const incomingMachines = new Map();
const incomingMachine = (cell, neighbours, target) => {
  const directions = neighbours.map(neighbour => directionTo(neighbour, cell));
  const name = `${target}:${directions.join('')}`;
  if (incomingMachines.has(name)) return incomingMachines.get(name);
  const machine = NFA.encodeSpec({
  startState: { count: 0, index: 0 },
  transition: (state, value) => {
    if (state.done) return state;
    const { count, index } = state;
    if (index === neighbours.length) return { done: true, count };
    const next = count + (value === directions[index] ? 1 : 0);
    if (next > target) return undefined;
    return index + 1 === neighbours.length
      ? { done: true, count: next }
      : { count: next, index: index + 1 };
  },
  accept: ({ done, count }) => done === true && count === target,
  }, geometry.numValues);
  incomingMachines.set(name, machine);
  return machine;
};
const incomingRules = cells.map(cell => {
  const neighbours = graph.neighbours(cell);
  if (neighbours.length === 2) {
    const directions = neighbours.map(neighbour => directionTo(neighbour, cell));
    const key = Pair.fnToKey((a, b) => (a === directions[0]) !== (b === directions[1]), geometry.numValues);
    return new Pair(key, 'incoming degree', ...exit.at(neighbours));
  }
  return new NFA(incomingMachine(cell, neighbours, cell === START ? 0 : 1),
    'incoming degree', ...exit.at(neighbours));
});

// A route edge imposes the stated difference-of-at-least-two condition. The
// right/down scan covers every orthogonal edge once, in either travel direction.
const differenceMachine = (forwardDirection, backwardDirection) => NFA.encodeSpec({
  startState: { phase: 'exitA' },
  transition: (state, value) => {
    if (state.phase === 'exitA') return { phase: 'digitA', exitA: value };
    if (state.phase === 'digitA') return { phase: 'exitB', exitA: state.exitA, digitA: value };
    if (state.phase === 'exitB') return { phase: 'digitB', exitA: state.exitA, digitA: state.digitA, exitB: value };
    const joined = state.exitA === forwardDirection || state.exitB === backwardDirection;
    return !joined || Math.abs(state.digitA - value) >= 2 ? { done: true } : undefined;
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

// A counter advances exactly when its source cell exits to the adjacent target.
const counterMachine = (forwardDirection, backwardDirection, modulus) => NFA.encodeSpec({
  startState: { phase: 'exitA' },
  transition: (state, value) => {
    if (state.phase === 'exitA') return { phase: 'a', exitA: value };
    if (state.phase === 'a') return { phase: 'exitB', exitA: state.exitA, a: value };
    if (state.phase === 'exitB') return { phase: 'b', exitA: state.exitA, a: state.a, exitB: value };
    const forward = state.exitA === forwardDirection;
    const backward = state.exitB === backwardDirection;
    const next = value => value === modulus ? 1 : value + 1;
    if (forward) return value === next(state.a) ? { done: true } : undefined;
    if (backward) return state.a === next(value) ? { done: true } : undefined;
    return { done: true };
  },
  accept: ({ done }) => done === true,
}, geometry.numValues);

const differenceRight = differenceMachine(RIGHT, LEFT);
const differenceDown = differenceMachine(DOWN, UP);
const countersRight = [5, 7, 8].map(modulus => counterMachine(RIGHT, LEFT, modulus));
const countersDown = [5, 7, 8].map(modulus => counterMachine(DOWN, UP, modulus));

const edgeRules = cells.flatMap(cell => [[0, 1], [1, 0]].flatMap(([dr, dc]) => {
  const other = graph.step(cell, dr, dc);
  if (!other) return [];
  const horizontal = dc === 1;
  const difference = horizontal ? differenceRight : differenceDown;
  const counters = horizontal ? countersRight : countersDown;
  return [
    new NFA(difference, 'route difference', exit.at(cell), cell, exit.at(other), other),
    new NFA(counters[0], 'position mod 5', exit.at(cell), pos5.at(cell), exit.at(other), pos5.at(other)),
    new NFA(counters[1], 'position mod 7', exit.at(cell), pos7.at(cell), exit.at(other), pos7.at(other)),
    new NFA(counters[2], 'position mod 8', exit.at(cell), pos8.at(cell), exit.at(other), pos8.at(other)),
  ];
}));

// Ice permits a turn only when its cell digit equals its row, column, or box
// number. The incoming direction is supplied by the unique neighbour that exits
// into this cell; endpoints do not turn.
const straightMachines = new Map();
const straightMachine = (cell, neighbours) => {
  const directions = neighbours.map(neighbour => directionTo(neighbour, cell));
  const name = directions.join('');
  if (straightMachines.has(name)) return straightMachines.get(name);
  const machine = NFA.encodeSpec({
    startState: { phase: 'exit' },
    transition: (state, value) => {
      if (state.done) return state;
      if (state.phase === 'exit') return { phase: 'neighbours', exit: value, incoming: null, index: 0 };
      const incoming = value === directions[state.index] ? directions[state.index] : state.incoming;
      return state.index + 1 === directions.length
        ? { done: true, exit: state.exit, incoming }
        : { phase: 'neighbours', exit: state.exit, incoming, index: state.index + 1 };
    },
    accept: ({ done, exit: direction, incoming }) => done === true && direction === incoming,
  }, geometry.numValues);
  straightMachines.set(name, machine);
  return machine;
};
const turnRules = cells.filter(cell => cell !== START && cell !== FINISH).map(cell => {
  const { row, col } = parseCellId(cell);
  const friendly = [row, col, Math.floor((row - 1) / 3) * 3 + Math.floor((col - 1) / 3) + 1];
  const neighbours = graph.neighbours(cell);
  return new Or([
    new NFA(straightMachine(cell, neighbours), 'straight on ice', exit.at(cell), ...exit.at(neighbours)),
    new Given(cell, ...friendly),
  ]);
});

// White snowballs are the five drawn consecutive-digit dominoes.
const snowballs = [
  ['R1C3', 'R2C3'], ['R8C1', 'R8C2'], ['R8C2', 'R9C2'],
  ['R8C3', 'R8C4'], ['R8C8', 'R8C9'],
].map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  new Given('R3C2', 4), new Given('R3C8', 2), new Given('R6C4', 9), new Given('R7C6', 8),
  exit.toVar('route exit'), pos5.toVar('position mod 5'), pos7.toVar('position mod 7'), pos8.toVar('position mod 8'),
  ...exitDomains,
  new Given(pos5.at(START), 1), new Given(pos7.at(START), 1), new Given(pos8.at(START), 1),
  pos5.makeReplicate(new Given(pos5.cells()[0], 1, 2, 3, 4, 5)),
  pos7.makeReplicate(new Given(pos7.cells()[0], 1, 2, 3, 4, 5, 6, 7)),
  pos8.makeReplicate(new Given(pos8.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8)),
  ...incomingRules,
  ...edgeRules,
  ...turnRules,
  ...snowballs,
];
