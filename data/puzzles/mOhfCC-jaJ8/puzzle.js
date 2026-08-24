// Title: BYOS - Build Your Own Sandwich
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=mOhfCC-jaJ8
// Source: https://app.crackingthecryptic.com/sudoku/7j73hDtR7r

// Normal sudoku rules apply (default row/column/box all-different, no
// digits given). Each grid cage below is labelled with a letter matching an
// outside sandwich-clue lane of the same letter. The cage's own digits,
// read left-to-right for a horizontally-laid cage or top-to-bottom for a
// vertical one (a single-cell cage is just that one digit), spell the 1- or
// 2-digit total for that lane: the sum of the digits strictly between
// whichever of {1, 9} appears first and whichever appears second, scanned
// in the lane's reading direction. No numeric sandwich totals are printed
// anywhere, so both the totals and the digits spelling them are entirely
// solver-determined.

function rowCells(r) { return Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1)); }
function colCells(c) { return Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c)); }

function rowMajor(cells) {
  return [...cells].sort((a, b) => {
    const A = parseCellId(a), B = parseCellId(b);
    return A.row - B.row || A.col - B.col;
  });
}

// Shared automaton, reused for every lane/cage pair: segment 1 is the
// lane's 9 cells in reading order (accumulating the between-1-and-9 sum);
// segment 2 is the cage's cells, fed *least-significant digit first* (see
// sandwichEquals) so at most one place-value weight (1, then 10) is ever
// pending. Rather than carrying the lane sum and the cage's digits as
// separate fields (whose cross-product blows the compiled-state limit), the
// state after the break carries only the outstanding difference against
// the lane sum, rather than both totals, to keep the compiled state count
// small.
const sandwichSpec = NFA.encodeSpec({
  startState: {
    phase: 'before', firstSeen: null, sum: 0,
    seenBreak: false, diff: 0, place: 1,
  },
  transition: (state, value) => {
    if (value === SEGMENT_BREAK) {
      // Only one break is ever fed (two segments); reject a second one
      // rather than leaving it to grow the state space unboundedly.
      if (state.seenBreak) return undefined;
      // The lane scan is done and its sum is final: the cage's number must
      // close the gap down to 0.
      return { seenBreak: true, diff: state.sum, place: 1 };
    }
    if (!state.seenBreak) {
      if (state.phase === 'before') {
        // First bookend seen (either order: 1-then-9 or 9-then-1).
        if (value === 1 || value === 9) {
          return { ...state, phase: 'between', firstSeen: value };
        }
        return state;
      }
      if (state.phase === 'between') {
        const closingValue = state.firstSeen === 1 ? 9 : 1;
        if (value === closingValue) return { ...state, phase: 'after' };
        // Saturate: a cage total is at most 2 digits (<= 99), so once the
        // running sum passes that it can never match and 100 is as good a
        // sink as any exact higher value -- keeps the state count bounded.
        return { ...state, sum: Math.min(state.sum + value, 100) };
      }
      return state; // phase === 'after': remaining lane cells don't count.
    }
    // Reading a cage digit at the current place value (1, then 10). A cage
    // is at most 2 cells, so a 3rd post-break symbol would be invalid input;
    // reject it instead of letting place climb unboundedly.
    if (state.place > 10) return undefined;
    return { seenBreak: true, diff: state.diff - state.place * value, place: state.place * 10 };
  },
  accept: (state) => state.diff === 0,
}, 9, { multiSegment: true });

function sandwichEquals(laneCells, cageCells) {
  // Feed the cage's digits least-significant first, matching sandwichSpec.
  const digitsLowFirst = [...cageCells].reverse();
  return new NFA(sandwichSpec, 'sandwich=cage', laneCells, digitsLowFirst);
}

// Outside sandwich-clue lanes, keyed by letter (drawn as a lettered badge
// above a column or to the left of a row).
const lanes = {
  A: colCells(6),
  B: colCells(8),
  C: colCells(4),
  D: rowCells(6),
  E: rowCells(8),
  F: colCells(1),
  G: colCells(3),
  H: rowCells(3),
  J: colCells(9),
  K: colCells(5),
  L: rowCells(4),
};

// Grid cages, each tagged with the lane letter it encodes (drawn as a small
// lettered badge in the cage's cells). A and F each label two separate
// single-cell cages.
const cages = [
  ['J', ['R1C1', 'R1C2']],
  ['K', ['R2C2', 'R2C3']],
  ['F', ['R2C5']],
  ['F', ['R4C8']],
  ['G', ['R1C9', 'R2C9']],
  ['D', ['R4C4', 'R4C5']],
  ['B', ['R5C6']],
  ['C', ['R6C6', 'R6C7']],
  ['A', ['R8C9']],
  ['E', ['R8C3', 'R8C4']],
  ['A', ['R7C1']],
  ['H', ['R9C2']],
  ['L', ['R6C4', 'R7C4']],
];

return [
  new Shape('9x9'),
  ...cages.map(([label, cells]) => sandwichEquals(lanes[label], rowMajor(cells))),
];
