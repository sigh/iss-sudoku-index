// Title: Pop Goes The World
// Author: Alchemist
// Video: https://www.youtube.com/watch?v=sS6c_tzJdqg
// Source: https://sudokupad.app/m1p2mis3fb

// Normal Sudoku rules apply. A VP overlay records trigger, subsequently popped,
// and unpopped cells. There is one trigger in each row, column, and 3x3 box.
// A non-trigger popped cell has a greater adjacent popped digit; an unpopped
// cell has no greater adjacent popped digit. Together these local conditions
// describe the stated repeated pop process without choosing its trigger cells.
// Bubbles are unpopped and count popped king-neighbours. Each drawn pinprick
// points to its smaller digit and has one popped and one unpopped endpoint.

const TRIGGER = 1;
const POPPED = 2;
const UNPOPPED = 3;

const graph = cellGraph('9x9');
const pop = graph.makeOverlay('VP');

// The overlay state is followed by zero or more (neighbour digit, neighbour
// state) pairs. A greater popped neighbour is the immediate cause of a regular
// popped cell; strictly increasing digits force every such chain to a trigger.
const popProcessMachine = NFA.encodeSpec({
  startState: { phase: 'ownDigit' },
  transition: ({ phase, ownDigit, ownState, neighbourDigit, hasGreater }, value) => {
    if (phase === 'ownDigit') return { phase: 'ownState', ownDigit: value };
    if (phase === 'ownState') return {
      phase: 'neighbourDigit', ownDigit, ownState: value, hasGreater: false,
    };
    if (phase === 'neighbourDigit') return {
      phase: 'neighbourState', ownDigit, ownState, neighbourDigit: value, hasGreater,
    };
    return {
      phase: 'neighbourDigit',
      ownDigit,
      ownState,
      hasGreater: hasGreater || (value !== UNPOPPED && neighbourDigit > ownDigit),
    };
  },
  accept: ({ phase, ownState, hasGreater }) => phase === 'neighbourDigit' && (
    ownState === TRIGGER ||
    (ownState === POPPED && hasGreater) ||
    (ownState === UNPOPPED && !hasGreater)
  ),
}, 9);

// Exactly one trigger state appears in each of the 27 stated Sudoku groups.
const oneTriggerMachine = NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, state) => {
    const next = count + (state === TRIGGER ? 1 : 0);
    return next <= 1 ? { count: next } : undefined;
  },
  accept: ({ count }) => count === 1,
}, 9);

// A bubble's digit is followed by its up-to-eight king-neighbour states.
const bubbleMachine = NFA.encodeSpec({
  startState: { target: null, count: 0 },
  transition: ({ target, count }, value) => {
    if (target === null) return { target: value, count: 0 };
    const next = count + (value === UNPOPPED ? 0 : 1);
    return next <= target ? { target, count: next } : undefined;
  },
  accept: ({ target, count }) => count === target,
}, 9);

// Each stream is (larger digit, its pop state, smaller digit, its pop state).
const pinprickMachine = NFA.encodeSpec({
  startState: { phase: 'largeDigit' },
  transition: ({ phase, largeDigit, largeState, smallDigit }, value) => {
    if (phase === 'largeDigit') return { phase: 'largeState', largeDigit: value };
    if (phase === 'largeState') return { phase: 'smallDigit', largeDigit, largeState: value };
    if (phase === 'smallDigit') return {
      phase: 'smallState', largeDigit, largeState, smallDigit: value,
    };
    return largeDigit > smallDigit && ((largeState === UNPOPPED) !== (value === UNPOPPED))
      ? { phase: 'done' } : undefined;
  },
  accept: ({ phase }) => phase === 'done',
}, 9);

// Drawn bubble cells, transcribed from the circle underlays.
const bubbles = [
  'R1C6', 'R1C9', 'R3C5', 'R3C6', 'R3C8', 'R4C4', 'R6C7',
  'R7C7', 'R7C9', 'R8C3', 'R8C5', 'R9C1', 'R9C9',
];
// Drawn pinpricks, listed larger endpoint first because each glyph points lower.
const pinpricks = [['R8C1', 'R8C2'], ['R4C6', 'R5C6'], ['R6C4', 'R5C4']];

return [
  new Shape('9x9'),
  pop.toVar('pop status'),
  pop.makeReplicate(new Given(pop.cells()[0], TRIGGER, POPPED, UNPOPPED)),
  ...graph.cells().map(cell => new NFA(popProcessMachine, 'pop process',
    cell, pop.at(cell),
    ...graph.neighbours(cell).flatMap(neighbour => [neighbour, pop.at(neighbour)]))),
  ...[...pop.rows(), ...pop.columns(), ...pop.boxes()].map(group =>
    new NFA(oneTriggerMachine, 'one trigger', ...group)),
  ...bubbles.flatMap(cell => [
    new Given(pop.at(cell), UNPOPPED),
    new NFA(bubbleMachine, 'bubble count', cell, ...pop.at(graph.kingNeighbours(cell))),
  ]),
  ...pinpricks.map(([large, small]) => new NFA(pinprickMachine, 'pinprick',
    large, pop.at(large), small, pop.at(small))),
];
