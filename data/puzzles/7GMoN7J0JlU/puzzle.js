// Title: Bits & Nibbles
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=7GMoN7J0JlU
// Source: https://sudokupad.app/xag582l3t0

// Parity Counter Lines: the two end cells of a line report the counts of odd
// and even digits along the whole line (endpoints included). The rule does
// not say which end holds the odd count and which holds the even count, so
// the NFA accepts either assignment.

const parityCounterNFA = NFA.encodeSpec({
  // `first`/`last` latch the two end-cell digits; `pos`/`odd` are the
  // running cell count and running odd-digit count (even count = pos - odd).
  startState: { first: null, last: null, pos: 0, odd: 0 },
  transition: (state, value) => {
    const odd = state.odd + (value % 2 === 1 ? 1 : 0);
    const pos = state.pos + 1;
    const first = state.first === null ? value : state.first;
    return { first, last: value, pos, odd };
  },
  accept: (state) => {
    const even = state.pos - state.odd;
    return (state.first === state.odd && state.last === even) ||
      (state.first === even && state.last === state.odd);
  },
  // Longest Parity Counter Line drawn here is 8 cells; without a cap the
  // compiler explores `pos` (and `odd`) as unbounded counters.
  maxDepth: 8,
}, 9);

const parityCounterLines = [
  ['R2C3', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R3C5', 'R2C4'],
  ['R2C7', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R7C7'],
  ['R8C5', 'R7C4', 'R7C3', 'R7C2', 'R8C2', 'R9C2'],
];

// BitClock: a central arrow cell plus its four orthogonal neighbours. The
// arrow digit selects a fixed 4-bit odd/even code (1 = odd/OFF, 0 =
// even/ON) from the rules' table; reading the neighbours clockwise starting
// at the arrow's own direction must match that code exactly.
const BIT_CLOCK_CODES = {
  1: [1, 1, 1, 0], // OOOE
  2: [1, 1, 0, 1], // OOEO
  3: [1, 1, 0, 0], // OOEE
  4: [1, 0, 1, 1], // OEOO
  5: [1, 0, 1, 0], // OEOE
  6: [1, 0, 0, 1], // OEEO
  7: [1, 0, 0, 0], // OEEE
  8: [0, 1, 1, 1], // EOOO
  9: [0, 1, 1, 0], // EOOE
};

const bitClockNFA = NFA.encodeSpec({
  startState: { pattern: null, pos: 0 },
  transition: (state, value) => {
    if (state.pattern === null) {
      // First cell scanned is the arrow cell itself: its digit fixes the
      // pattern the four neighbours must follow.
      return { pattern: BIT_CLOCK_CODES[value], pos: 0 };
    }
    if (value % 2 !== state.pattern[state.pos]) return undefined;
    return { pattern: state.pattern, pos: state.pos + 1 };
  },
  accept: (state) => state.pattern !== null && state.pos === 4,
}, 9);

// Clockwise compass cycle; a BitClock reads its neighbours starting at the
// arrow's own direction and continuing clockwise around this cycle.
const CLOCKWISE = ['up', 'right', 'down', 'left'];
const DIRECTION_DELTA = { up: [-1, 0], right: [0, 1], down: [1, 0], left: [0, -1] };

function bitClockCells(row, col, startDirection) {
  const startIndex = CLOCKWISE.indexOf(startDirection);
  const order = [0, 1, 2, 3].map(i => CLOCKWISE[(startIndex + i) % 4]);
  return [
    makeCellId(row, col),
    ...order.map(dir => {
      const [dr, dc] = DIRECTION_DELTA[dir];
      return makeCellId(row + dr, col + dc);
    }),
  ];
}

// [row, col, arrow direction] for each of the 16 drawn BitClock arrows.
const bitClocks = [
  [2, 2, 'left'],
  [2, 3, 'left'],
  [3, 8, 'left'],
  [3, 3, 'up'],
  [3, 7, 'up'],
  [4, 5, 'up'],
  [6, 2, 'up'],
  [7, 3, 'up'],
  [5, 3, 'right'],
  [3, 6, 'right'],
  [5, 8, 'right'],
  [8, 2, 'right'],
  [6, 5, 'down'],
  [7, 5, 'down'],
  [7, 6, 'down'],
  [8, 4, 'right'],
];

return [
  new Shape('9x9'),

  ...parityCounterLines.map(
    cells => new NFA(parityCounterNFA, 'parity-counter', ...cells)),

  ...bitClocks.map(
    ([row, col, dir]) => new NFA(bitClockNFA, 'bitclock', ...bitClockCells(row, col, dir))),
];
