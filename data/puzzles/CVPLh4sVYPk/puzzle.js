// Title: Age is a Mystery
// Author: Christoph Seeliger
// Video: https://www.youtube.com/watch?v=CVPLh4sVYPk
// Source: https://cracking-the-cryptic.web.app/sudoku/9rTPjD6rRt

// Normal sudoku on the default 9x9 shape: rows, columns and boxes are
// all-different. Every printed clue in the puzzle is 48.
//
//   Little killer (outside arrow): the digits along the indicated diagonal
//     sum to 48; digits may repeat along a diagonal.
//   Sandwich product (above a column): the digits strictly between the 1 and
//     the 9 of that column multiply to 48.
//   Parity Party (left of a row): reading the row from the left, the digits
//     up to and including the first one whose parity differs from the run
//     before it multiply to 48.
//   X-Factor (below a column): reading the column upwards, X is the first
//     digit read, and the first X digits -- X's own cell included -- multiply
//     to 48.
//
// Omitted: the drawn four-cell cage R6C7,R7C7,R8C7,R9C7 labelled 48. The
// rules state no cage clue, and the killer reading is impossible here (four
// different digits of one column reach at most 9+8+7+6 = 30), so what the 48
// asserts about those cells is not settled by the rules or the art.

const CLUE = 48;
const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');

// Every clue below is a product that must land exactly on CLUE, so each
// prefix of it divides CLUE and the running product only ever takes one of
// CLUE's ten divisors. Rejecting anything else keeps these machines small and
// is what bounds their state.
const divides = (product) => CLUE % product === 0;

// Sandwich product. `phase` says where the scan stands relative to the 1/9
// crusts: `before` (neither seen), `inside` (between them, `prod` being the
// running product of the filling), `after` (both seen and the product
// matched, the rest of the column free). Whichever of 1/9 comes first opens
// the sandwich, which is what makes the clue direction-free.
const sandwichSpec = NFA.encodeSpec({
  startState: { phase: 'before', prod: 1 },
  transition: ({ phase, prod }, value) => {
    const isCrust = value === 1 || value === 9;
    if (phase === 'after') return { phase: 'after', prod: 1 };
    if (phase === 'before') {
      return isCrust ? { phase: 'inside', prod: 1 } : { phase: 'before', prod: 1 };
    }
    if (isCrust) return prod === CLUE ? { phase: 'after', prod: 1 } : undefined;
    const next = prod * value;
    return divides(next) ? { phase: 'inside', prod: next } : undefined;
  },
  accept: ({ phase }) => phase === 'after',
}, 9);

// Parity Party. `runParity` is the parity of the digits read so far (null
// before the first one), so the first digit only sets the run and can never
// end it. The product closes on the first digit of the other parity, that
// digit included; `done` marks the stop, after which the row is free.
const paritySpec = NFA.encodeSpec({
  startState: { runParity: null, prod: 1, done: false },
  transition: ({ runParity, prod, done }, value) => {
    if (done) return { runParity: null, prod: 1, done: true };
    const next = prod * value;
    if (!divides(next)) return undefined;
    const parity = value % 2;
    if (runParity === null || parity === runParity) {
      return { runParity: parity, prod: next, done: false };
    }
    return next === CLUE ? { runParity: null, prod: 1, done: true } : undefined;
  },
  accept: ({ done }) => done,
}, 9);

// X-Factor. The first digit read is X, serving both as the first factor and
// as the count of digits the product spans, so `left` holds how many digits
// are still to come (null before X itself has been read).
const xFactorSpec = NFA.encodeSpec({
  startState: { left: null, prod: 1, done: false },
  transition: ({ left, prod, done }, value) => {
    if (done) return { left: 0, prod: 1, done: true };
    const next = left === null ? value : prod * value;
    const remaining = (left === null ? value : left) - 1;
    if (!divides(next)) return undefined;
    if (remaining === 0) {
      return next === CLUE ? { left: 0, prod: 1, done: true } : undefined;
    }
    return { left: remaining, prod: next, done: false };
  },
  accept: ({ done }) => done,
}, 9);

// Clue lanes, transcribed from the "48" labels drawn in the outside ring: the
// sandwich products sit above C1, C3 and C5, the Parity Party clues left of
// R4 and R9, and the X-Factor clues below C4 and C6. Each machine is fed its
// lane in reading order -- down a sandwich column, rightwards from a Parity
// Party clue, upwards from an X-Factor clue.
const sandwichProducts = [1, 3, 5].map((col) => new NFA(
  sandwichSpec, `Sandwich product C${col}`,
  ...graph.ray(makeCellId(1, col), 1, 0)));
const parityParties = [4, 9].map((row) => new NFA(
  paritySpec, `Parity Party R${row}`,
  ...graph.ray(makeCellId(row, 1), 0, 1)));
const xFactors = [4, 6].map((col) => new NFA(
  xFactorSpec, `X-Factor C${col}`,
  ...graph.ray(makeCellId(9, col), -1, 0)));

// The three drawn arrows all point down-left; each ray starts at the cell its
// arrowhead touches on the border it crosses.
const littleKillers = [
  LittleKiller.fromCells(CLUE, graph.ray('R1C7', 1, -1), geometry),
  LittleKiller.fromCells(CLUE, graph.ray('R1C9', 1, -1), geometry),
  LittleKiller.fromCells(CLUE, graph.ray('R3C9', 1, -1), geometry),
];

return [
  new Shape('9x9'),

  new Given('R2C1', 4),
  new Given('R8C9', 8),

  ...littleKillers,
  ...sandwichProducts,
  ...parityParties,
  ...xFactors,
];
