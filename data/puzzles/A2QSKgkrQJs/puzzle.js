// Title: In Order Sudoku
// Author: Mesmer
// Video: https://www.youtube.com/watch?v=A2QSKgkrQJs
// Source: https://cracking-the-cryptic.web.app/sudoku/GmBJ67Q3gH

// Normal sudoku rules (rows, columns, default 3x3 boxes -- the drawn regions
// are exactly the standard tiling, so no explicit Regions constraint is
// needed). One given. Every row and column also carries an outside clue of
// three digits that must appear, in that order, somewhere in the row/column
// read in its natural direction (left-to-right for rows, top-to-bottom for
// columns) -- not necessarily adjacent, with any other digits interleaved.
//
// Row/column clue triples are transcribed from the payload's outer margin
// cells (left band per row, top band per column).

const graph = cellGraph('9x9');

const rowOrder = {
  1: [4, 2, 3],
  2: [2, 7, 3],
  3: [1, 3, 7],
  4: [6, 2, 5],
  5: [2, 1, 6],
  6: [8, 1, 5],
  7: [1, 6, 2],
  8: [7, 4, 2],
  9: [3, 2, 4],
};

const colOrder = {
  1: [3, 4, 2],
  2: [1, 6, 4],
  3: [4, 2, 3],
  4: [4, 3, 2],
  5: [1, 4, 3],
  6: [4, 2, 3],
  7: [4, 3, 2],
  8: [2, 8, 5],
  9: [5, 4, 3],
};

// Subsequence-match automaton: the state is how many of `target`'s digits
// have been matched so far, in order. A cell whose value equals the next
// wanted digit advances the count; any other value leaves it unchanged.
// Accepting requires all of `target` to have been matched by the end of the
// scan, which is exactly "these digits appear, in this order, somewhere in
// the line".
function subsequenceSpec(target) {
  return NFA.encodeSpec({
    startState: 0,
    transition: (matched, value) =>
      (matched < target.length && value === target[matched]) ? matched + 1 : matched,
    accept: (matched) => matched === target.length,
  }, 9);
}

return [
  new Shape('9x9'),
  new Given('R3C8', 7),
  ...Object.entries(rowOrder).map(([r, target]) =>
    new NFA(subsequenceSpec(target), 'RowInOrder', graph.row(Number(r)))),
  ...Object.entries(colOrder).map(([c, target]) =>
    new NFA(subsequenceSpec(target), 'ColInOrder', graph.column(Number(c)))),
];
