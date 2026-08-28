// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=9ZZ1mSHwCHY
// Source: https://cracking-the-cryptic.web.app/sudoku/q8jT697Njb

// Normal sudoku rules apply (standard 3x3 boxes).
//
// A clue outside the grid gives the sum of the ODD digits that lie strictly
// between the 2 and the 8 in that row/column: locate the 2 and the 8
// (whichever comes first along the line), then sum the odd-valued digits
// strictly between them. Even digits between them, and every digit outside
// that span, are not counted.
//
// Every one of rows 1-8 carries such a clue on the left; every one of
// columns 1-8 carries one on top (16 clues total). Row 9 and column 9 carry
// no outside clue -- instead nearly all of row 9 and column 9 are given
// directly, and R9C9 is left for sudoku to force to 8.

// Sum-of-odd-digits-strictly-between-the-2-and-the-8 state machine. Built
// fresh per clue so the running sum can be clamped at target+1, keeping the
// compiled state small.
//   phase 'before' - neither 2 nor 8 has been read yet
//   phase 'afterX' - exactly one of {2, 8} has been read; sum accumulates
//   phase 'after'  - both have been read; later digits are ignored
const betweenOddSumSpec = (target) => NFA.encodeSpec({
  startState: { phase: 'before', sum: 0 },
  transition: (state, value) => {
    const { phase, sum } = state;
    if (phase === 'before') {
      if (value === 2 || value === 8) return { phase: 'afterX', sum: 0 };
      return { phase: 'before', sum: 0 };
    }
    if (phase === 'afterX') {
      if (value === 2 || value === 8) return { phase: 'after', sum };
      const add = (value % 2 === 1) ? value : 0;
      return { phase: 'afterX', sum: Math.min(sum + add, target + 1) };
    }
    return { phase: 'after', sum };
  },
  accept: (state) => state.phase === 'after' && state.sum === target,
}, 9);

const rowLine = (r) => Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1));
const colLine = (c) => Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c));

// Row clues (left margin, R1..R8).
const rowClues = [0, 5, 20, 8, 12, 24, 8, 1];
// Column clues (top margin, C1..C8).
const colClues = [20, 0, 10, 25, 9, 3, 24, 0];
// Column 9, rows 1-8 (payload cells[r][8].value).
const col9Givens = [4, 6, 5, 2, 3, 1, 9, 7];
// Row 9, columns 1-8 (payload cells[8][c].value).
const row9Givens = [2, 1, 5, 4, 7, 9, 6, 3];

return [
  new Shape('9x9'),
  ...col9Givens.map((v, i) => new Given(makeCellId(i + 1, 9), v)),
  ...row9Givens.map((v, i) => new Given(makeCellId(9, i + 1), v)),
  ...rowClues.map((target, i) => new NFA(
    betweenOddSumSpec(target), `row${i + 1}-odd-between-2-8`, rowLine(i + 1))),
  ...colClues.map((target, i) => new NFA(
    betweenOddSumSpec(target), `col${i + 1}-odd-between-2-8`, colLine(i + 1))),
];
