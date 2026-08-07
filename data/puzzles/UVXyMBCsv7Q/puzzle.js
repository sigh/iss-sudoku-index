// Title: Sum Line Sudoku #2
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=UVXyMBCsv7Q
// Source: https://app.crackingthecryptic.com/sudoku/4hnrd6BrqT

// Standard sudoku (no givens, standard 3x3 boxes) plus one rule: for every
// triple of adjacent digits along a grey line, one of the three digits equals
// the sum of the other two. Repeats are allowed along a line wherever
// row/column/box rules permit them, so no AllDifferent is added for the
// lines themselves.
//
// Each line is encoded as an NFA scanning its cells in drawn order, sliding a
// window of 3 consecutive digits and rejecting any window that fails the
// triple-sum test. The window only needs to remember the previous two
// digits, so the state space is tiny (at most 10x10 including "not yet
// seen"). `accept` is unconditionally true: every violation is caught inside
// `transition`, so there is nothing left to check once the scan ends.
const sumTripleSpec = NFA.encodeSpec({
  startState: { prev2: null, prev1: null },
  transition: ({ prev2, prev1 }, value) => {
    if (prev2 !== null) {
      const ok = prev2 === prev1 + value || prev1 === prev2 + value || value === prev1 + prev2;
      if (!ok) return undefined;
    }
    return { prev2: prev1, prev1: value };
  },
  accept: () => true,
}, 9);

// Cell paths, transcribed from the drawn grey lines by interpolating each
// polyline segment cell-by-cell. Line order matches the drawing order.
const openLines = [
  ['R1C1', 'R2C1', 'R3C2', 'R3C1', 'R2C2', 'R3C3'],
  ['R1C2', 'R1C3', 'R1C4', 'R2C4', 'R2C3'],
  ['R3C4', 'R2C5', 'R1C5', 'R1C6'],
  ['R4C6', 'R3C5', 'R2C6', 'R3C6', 'R3C7'],
  ['R2C8', 'R3C9', 'R4C8'],
  ['R4C4', 'R5C4', 'R6C3'],
  ['R7C4', 'R8C4', 'R9C4'],
  ['R6C4', 'R7C5', 'R6C6'],
  ['R8C5', 'R7C6', 'R7C7', 'R8C7', 'R9C7', 'R9C6'],
  ['R6C7', 'R6C8', 'R6C9'],
];

// One drawn grey line is a closed loop (its path returns to its start cell).
// The 6 distinct cells here are its cycle order. Repeating the first two
// cells at the end feeds the sliding-3 window every wrap-around triple (the
// two centred on the join) as well as the 4 interior ones, covering each of
// the 6 cells exactly once as a triple's middle digit.
const closedLoopCells = ['R5C1', 'R6C1', 'R7C1', 'R8C2', 'R7C2', 'R6C2'];
const closedLoop = [...closedLoopCells, ...closedLoopCells.slice(0, 2)];

const sumLines = [...openLines, closedLoop]
  .map(cells => new NFA(sumTripleSpec, 'sum-triple', ...cells));

return [
  new Shape('9x9'),
  ...sumLines,
];
