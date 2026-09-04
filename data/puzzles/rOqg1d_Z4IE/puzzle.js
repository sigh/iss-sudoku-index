// Title: Smashed Sums
// Author: Michael Tang
// Video: https://www.youtube.com/watch?v=rOqg1d_Z4IE
// Source: https://cracking-the-cryptic.web.app/sudoku/7qBmf97R3B

// Rules encoded here (from the video's on-screen rules panel -- the source
// payload itself carries no rules text):
//  - Fill each row and column with the digits 1-6 (once each) and blacken
//    the remaining two cells.
//  - Each row/column's outside number equals the sum of the digits strictly
//    between its two blackened cells (digits before the first blackened cell
//    or after the second one do not count).
//  - Two columns (C2, C4) carry no outside number; the fill-and-blacken rule
//    still applies to them, just with no sum to check.
//
// BLACK stands for a blackened board cell. A "Raw" grid is used because a
// blackened cell repeats within a line and 1-6 does not fill all 8 cells of
// one, so no implicit latin rule applies to rows or columns.
const BLACK = 7;
const shape = new Shape('8x8', '1-7', 'Raw');
const graph = cellGraph(shape);

// Outside-clue tables, transcribed from the drawn margin overlays: left of
// the grid for rows 1-8, above it for columns 1,3,5,6,7,8. `null` marks a
// column with no printed clue (C2, C4).
const ROW_CLUES = [4, 19, 9, 11, 8, 9, 7, 9];
const COL_CLUES = [7, null, 20, null, 2, 0, 1, 9];

// Scans one line's 8 cells against its blackened-cell count, a bitmask of
// digits already placed, and (only when the line carries a clue) the running
// sum of digits seen while exactly one blackened cell has been passed (the
// segment strictly between the two blackened cells). A third blackened
// cell, a digit repeated in the line, or -- once a clue exists -- a
// between-sum that has already overshot it, dies immediately (the sum is
// monotonic non-decreasing while it accumulates, so an overshoot can never
// recover). Accept requires exactly two blackened cells seen and all six
// digits 1-6 placed (mask 0b111111 -- this is what forces "exactly two"
// blackened cells too: 8 cells with at most 6 distinct digit values cannot
// support a 7th or 8th digit cell), and, when the line carries a clue, the
// final between-sum equal to it. The `sum` field is dropped from the state
// entirely for a clueless line (C2, C4) so it cannot multiply the state
// count for a check that line never makes.
const lineSpec = (clue) => {
  if (clue === null) {
    return NFA.encodeSpec({
      startState: { blacks: 0, mask: 0 },
      transition: ({ blacks, mask }, value) => {
        if (value === BLACK) {
          if (blacks === 2) return undefined;
          return { blacks: blacks + 1, mask };
        }
        const bit = 1 << (value - 1);
        if (mask & bit) return undefined;
        return { blacks, mask: mask | bit };
      },
      accept: ({ blacks, mask }) => blacks === 2 && mask === 0b111111,
    }, shape);
  }
  return NFA.encodeSpec({
    startState: { blacks: 0, mask: 0, sum: 0 },
    transition: ({ blacks, mask, sum }, value) => {
      if (value === BLACK) {
        if (blacks === 2) return undefined;
        return { blacks: blacks + 1, mask, sum };
      }
      const bit = 1 << (value - 1);
      if (mask & bit) return undefined;
      const nextSum = blacks === 1 ? sum + value : sum;
      if (nextSum > clue) return undefined;
      return { blacks, mask: mask | bit, sum: nextSum };
    },
    accept: ({ blacks, mask, sum }) =>
      blacks === 2 && mask === 0b111111 && sum === clue,
  }, shape);
};

const lineConstraint = (clue, cells, name) =>
  new NFA(lineSpec(clue), name, ...cells);

return [
  shape,

  ...graph.rows().map(
    (cells, i) => lineConstraint(ROW_CLUES[i], cells, `row${i + 1}`)),
  ...graph.columns().map(
    (cells, i) => lineConstraint(COL_CLUES[i], cells, `col${i + 1}`)),
];
