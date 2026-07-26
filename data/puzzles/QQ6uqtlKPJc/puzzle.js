// Title: Jam Packed Thick Crust Club Sandwich
// Author: Shintaro Fushida-Hardy
// Video: https://www.youtube.com/watch?v=QQ6uqtlKPJc
// Source: https://sudokupad.app/94v9ipg7hq
//
// Standard sudoku, no givens. Two global rules apply to every row and column:
//
// 1. "No empty sandwich": no 3 orthogonally-adjacent cells hold only digits
//    from {7, 8, 9} (encoded for all 9 rows and all 9 columns).
// 2. An outside clue is |sum strictly between the 7 and the 8, minus sum
//    strictly between the 8 and the 9| along that clue's row/column. Eight
//    badges (left of R1, R3, R6, R8; above C1, C2, C3, C6) give this
//    difference as 0. The ninth badge (above C5) reads "?" -- per the rules
//    text ("'?' represents a digit (0~9) to be determined by the solver")
//    its value is not drawn and is left to be inferred only after the grid
//    is solved, so no numeric constraint is encoded for column 5.

const graph = cellGraph('9x9');

// Rule 1: no 3-in-a-row/column drawn only from {7, 8, 9}. State tracks
// membership-in-{7,8,9} for the previous two cells; a third one completing the
// run is rejected outright.
const noEmptySandwichSpec = NFA.encodeSpec({
  startState: { a: false, b: false },
  transition: ({ a, b }, value) => {
    const cur = value === 7 || value === 8 || value === 9;
    if (a && b && cur) return undefined;
    return { a: b, b: cur };
  },
  accept: () => true,
}, 9);
const allLines = [...graph.rows(), ...graph.columns()];

// Rule 2 (the 8 "0" clues): sum-between(7,8) == sum-between(8,9) in that line.
// Sudoku digits are non-negative, so equality is only reachable when 8 sits
// between 7 and 9 (the other two orderings would force one side's sum
// negative) -- e.g. with 7 then 9 then 8 in that order, sum-between(7,8) is
// necessarily sum-between(7,9) + 9 + sum-between(9,8), which can only equal
// sum-between(9,8) if the rest is 0, impossible with 9 in it. So the machine
// only ever has to watch the *one* pending side:
//   'S0'                          -- before 7, 8, or 9
//   {phase:'first', mark, sum}    -- saw 7 or 9 (`mark` = which); `sum` is the
//                                     running total of plain digits (1-6)
//                                     seen since it
//   {phase:'after8', mark, diff}  -- 8 has appeared; `mark` is the digit (7 or
//                                     9) still to come; `diff` counts down
//                                     from the pre-8 sum as the post-8 side
//                                     accumulates
//   'done'                        -- both sides matched; absorbs the rest of
//                                     the line
// 8 arriving before either 7 or 9, or the non-`mark` digit arriving before 8,
// both hit one of the impossible orderings above and reject immediately.
//
// The compiler explores the transition graph in the abstract (any of the 9
// values at any step, not just a single row's actual digits), so `sum` is
// clamped to SUM_CAP -- above the true max of 21 (the six non-7/8/9 digits) --
// to keep the compiled state count finite; real rows never reach the clamp.
const OTHER = { 7: 9, 9: 7 };
const SUM_CAP = 30;
const zeroDiffSpec = NFA.encodeSpec({
  startState: 'S0',

  transition: (state, value) => {
    if (state === 'done') return 'done';

    if (state === 'S0') {
      if (value === 8) return undefined; // 8 can't be first
      if (value === 7 || value === 9) return { phase: 'first', mark: value, sum: 0 };
      return 'S0';
    }

    if (state.phase === 'first') {
      const { mark, sum } = state;
      if (value === OTHER[mark]) return undefined; // 8 would be last, not the midpoint
      if (value === 8) return { phase: 'after8', mark: OTHER[mark], diff: sum };
      return { phase: 'first', mark, sum: Math.min(sum + value, SUM_CAP) };
    }

    // state.phase === 'after8'
    const { mark, diff } = state;
    if (value === mark) return diff === 0 ? 'done' : undefined;
    const nextDiff = diff - value;
    if (nextDiff < 0) return undefined; // this side already exceeds the other
    return { phase: 'after8', mark, diff: nextDiff };
  },

  accept: (state) => state === 'done',
}, 9);

// Provenance: left badges on R1, R3, R6, R8; top badges on C1, C2, C3, C6;
// all eight drawn as "0". C5's top badge is the omitted "?".
const zeroDiffLines = [
  graph.row(1), graph.row(3), graph.row(6), graph.row(8),
  graph.column(1), graph.column(2), graph.column(3), graph.column(6),
];

return [
  new Shape('9x9'),

  ...allLines.map((cells) => new NFA(noEmptySandwichSpec, 'no-empty-sandwich', ...cells)),
  ...zeroDiffLines.map((cells) => new NFA(zeroDiffSpec, 'sandwich-diff-0', ...cells)),
];
