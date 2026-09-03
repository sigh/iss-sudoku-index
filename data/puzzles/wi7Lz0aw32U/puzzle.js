// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wi7Lz0aw32U
// Source: https://cracking-the-cryptic.web.app/sudoku/Hrf77bnJtN

// Normal Sudoku rules apply.
//
// Outside clues: reading a row or column inwards from the clue, the first digit
// fixes a parity; the scan runs to the first digit of the opposite parity, and
// the digits read -- that last one included -- total the clue. All eight clues
// printed on this grid read 23.
//
// Lines: the digits on each of the five orange lines total 23.
//
// Omitted: the rules sentence also says each line has "unique content". Read as
// "the digits along a line are all different" it is unsatisfiable -- the 11-cell
// line cannot hold 11 distinct digits, and no all-different line of seven or
// more cells can total 23 either -- and the alternative reading, that no two
// lines hold the same content as one another, is not settled by anything drawn
// or stated. The clause is left unencoded.

// Grid-side reading order for each clue: the lane, listed from the clue inwards.
const down = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((r) => makeCellId(r, c));
const across = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map((c) => makeCellId(r, c));
const clueLanes = [
  ['C1 down', down(1)],
  ['C3 down', down(3)],
  ['C8 down', down(8)],
  ['R4 right', across(4)],
  ['R5 right', across(5)],
  ['R7 left', across(7).reverse()],
  ['C4 up', down(4).reverse()],
  ['C6 up', down(6).reverse()],
];

// State: `par` is the parity of the lane's first digit (null before it is read)
// and `sum` the running total of the digits read so far; `done` is the sink
// entered once a digit of the opposite parity has landed the total exactly on
// 23, after which the rest of the lane is unconstrained. A same-parity digit
// that reaches 23 or beyond is rejected, because at least one further digit --
// the parity-changing one -- still has to be added.
const CLUE_TOTAL = 23;
const parityChangeSum = NFA.encodeSpec({
  startState: { par: null, sum: 0, done: false },
  transition: (state, value) => {
    if (state.done) return state;
    if (state.par === null) return { par: value % 2, sum: value, done: false };
    const sum = state.sum + value;
    if (value % 2 === state.par) {
      return sum < CLUE_TOTAL ? { par: state.par, sum, done: false } : undefined;
    }
    return sum === CLUE_TOTAL ? { par: null, sum: 0, done: true } : undefined;
  },
  accept: (state) => state.done,
}, 9);

// Drawn orange strokes, with the cells each straight segment passes through
// filled in (R2C3-R3C4-R4C5-R5C6 and R6C7-R7C8-R8C9 are single diagonal runs).
const lineCells = [
  ['R3C7', 'R3C8', 'R4C9'],
  ['R2C1', 'R3C2', 'R2C3', 'R3C4', 'R4C5', 'R5C6', 'R5C7', 'R6C7', 'R7C8',
    'R8C9', 'R9C8'],
  ['R7C6', 'R7C5', 'R8C5'],
  ['R7C3', 'R8C4', 'R9C3'],
  ['R8C3', 'R9C2', 'R8C1', 'R7C1'],
];

return [
  new Shape('9x9'),

  new Given('R1C5', 2),
  new Given('R1C6', 3),
  new Given('R4C4', 2),
  new Given('R4C5', 3),
  new Given('R5C7', 2),
  new Given('R6C5', 4),
  new Given('R6C7', 3),
  new Given('R7C5', 6),

  ...clueLanes.map(([name, cells]) => new NFA(parityChangeSum, name, cells)),

  ...lineCells.map((cells) => new Sum(23, ...cells)),
];
