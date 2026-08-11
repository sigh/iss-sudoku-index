// Title: Doubling Lines Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=WryXvuzoqcg
// Source: https://tinyurl.com/5d6mx8ut

// Normal sudoku rules (default row/column/box all-different from Shape('9x9')).
// Plus: every digit that appears along a gray line must appear exactly twice
// on that line (0 occurrences is fine; 1 or 3+ is not). All 8 drawn lines are
// gray (#BBBBBB), so all 8 are in scope. No cell belongs to more than one
// line, so each line is an independent per-digit occurrence-count rule.
//
// Encoded per digit t (1-9): a compact "count(t) on this line is 0 or 2"
// NFA, run once across all 8 lines as separate multiSegment segments. `accept`
// only runs on the FINAL state after the last segment, so the 0-or-2 check
// must also happen in `transition` at every SEGMENT_BREAK (which covers every
// line except the last one); `accept` then covers that final line. A third
// occurrence of t on a segment has no outgoing transition, so the branch dies
// immediately -- no extra state is needed for "count == 3".
const grayLines = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'],
  ['R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'],
  ['R6C3', 'R5C4', 'R4C5', 'R3C6'],
  ['R4C7', 'R5C6', 'R6C5', 'R7C4'],
  ['R4C2', 'R3C3'],
  ['R6C8', 'R7C7'],
];

const doublingSpecs = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(t => NFA.encodeSpec({
  startState: { count: 0 },
  transition: ({ count }, value) => {
    if (value === SEGMENT_BREAK) {
      if (count !== 0 && count !== 2) return undefined; // prior line invalid
      return { count: 0 };
    }
    if (value !== t) return { count };
    if (count >= 2) return undefined; // a 3rd occurrence of t: dead branch
    return { count: count + 1 };
  },
  accept: ({ count }) => count === 0 || count === 2,
}, 9, { multiSegment: true }));

const doublingLineConstraints = doublingSpecs.map((spec, i) => new NFA(
  spec, `doubling line, digit ${i + 1}`, ...grayLines,
));

const givens = [
  ['R1C5', 2], ['R2C4', 1], ['R2C6', 4], ['R3C5', 3],
  ['R4C2', 4], ['R4C8', 5], ['R5C1', 6], ['R5C3', 3],
  ['R5C7', 4], ['R5C9', 7], ['R6C2', 5], ['R6C8', 6],
  ['R7C5', 8], ['R8C4', 6], ['R8C6', 9], ['R9C5', 7],
].map(([cell, v]) => new Given(cell, v));

return [
  new Shape('9x9'),
  ...givens,
  ...doublingLineConstraints,
];
