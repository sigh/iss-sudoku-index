// Title: 1919 Sandwiches
// Author: RockyRoer
// Video: https://www.youtube.com/watch?v=5tK9CuOrAQM
// Source: https://app.crackingthecryptic.com/sudoku/tRbj3PPJ6F

// Normal sudoku rules apply.
//
// Self-indexing rules: a digit in row 1 gives the row containing the 1 in
// that column; a digit in row 9 gives the row containing the 9 in that
// column; a digit in column 1 gives the column containing the 1 in that row;
// a digit in column 9 gives the column containing the 9 in that row.
// `Indexing` derives each source cell's own row/column identity (1 for a
// row-1/column-1 cell, 9 for a row-9/column-9 cell) as the value it plants,
// so folding both lines of one direction into a single call is equivalent
// to writing them as four separate constraints.
//
// Outside clues give the sum, or the parity of the sum, of the digits
// strictly between the 1 and the 9 in that row/column -- a standard
// sandwich read against the digits' own values, independent of what those
// digits mean under the indexing rules above. Only the drawn lanes carry a
// clue; the rest are unclued. `Sandwich` covers the two numeric clues; the
// parity clues have no dedicated class, so they are read with a small NFA
// that tracks before/between/after the two bookend digits (1 and 9), with a
// parity bit while between, and rejects at the second bookend if the parity
// does not match the clue.

const grid = cellGraph('9x9');
const geometry = cellGeometry('9x9');

const indexing = [
  new Indexing('R', ...grid.row(1), ...grid.row(9)),
  new Indexing('C', ...grid.column(1), ...grid.column(9)),
];

// Sandwich sum clues -- source overlays: left R1 -> "4", top C6 -> "13".
const sums = [
  Sandwich.fromCells(4, grid.row(1), geometry),
  Sandwich.fromCells(13, grid.column(6), geometry),
];

const sandwichParitySpec = (targetParity) => NFA.encodeSpec({
  startState: { phase: 'before' },
  transition: (state, value) => {
    const isBookend = (value === 1 || value === 9);
    if (state.phase === 'before') {
      return isBookend ? { phase: 'between', parity: 0 } : state;
    }
    if (state.phase === 'between') {
      // Sum parity: toggle only when the digit itself is odd, not on every
      // digit seen (that would track the count between the bookends).
      if (!isBookend) return { phase: 'between', parity: state.parity ^ (value & 1) };
      return state.parity === targetParity ? { phase: 'after' } : undefined;
    }
    return state; // phase === 'after': absorb the remainder of the line.
  },
  accept: (state) => state.phase === 'after',
}, 9);

const SANDWICH_EVEN = sandwichParitySpec(0);
const SANDWICH_ODD = sandwichParitySpec(1);

// Sandwich parity clues -- source overlays: left R2 -> "odd", left R4 ->
// "even", top C3 -> "even", top C7 -> "odd", top C8 -> "odd", top C9 ->
// "even". Each scan gets its own name: the constraint serializer merges
// same-name/same-spec NFA calls into one multi-segment automaton (needing
// `multiSegment: true`, which this spec does not use), so reusing a name
// across these independent lines would silently and incorrectly join them.
const parities = [
  new NFA(SANDWICH_ODD, 'sandwich-parity-r2', ...grid.row(2)),
  new NFA(SANDWICH_EVEN, 'sandwich-parity-r4', ...grid.row(4)),
  new NFA(SANDWICH_EVEN, 'sandwich-parity-c3', ...grid.column(3)),
  new NFA(SANDWICH_ODD, 'sandwich-parity-c7', ...grid.column(7)),
  new NFA(SANDWICH_ODD, 'sandwich-parity-c8', ...grid.column(8)),
  new NFA(SANDWICH_EVEN, 'sandwich-parity-c9', ...grid.column(9)),
];

return [
  new Shape('9x9'),
  ...indexing,
  ...sums,
  ...parities,
];
