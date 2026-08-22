// Title: X-Distance Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=x_LOhQo6lIg
// Source: https://app.crackingthecryptic.com/sudoku/grfN7fj9gM
//
// Normal sudoku rules apply. Digits outside the grid have to be placed in
// the corresponding row/column in the given order, where the second digit
// is placed X cells away from the first digit and X is the digit in the
// first cell of that row/column.
//
// Reading: for a row/column with an outside pair (outer digit `a`, inner
// digit `b`, listed outer-to-inner), `a` occupies an
// earlier cell than `b` counting from the clue's side inward, and
// position(b) - position(a) equals X, the value of that row/column's own
// first cell (the cell nearest the clue). One row and one column carry no
// outside pair and are left as plain sudoku lines.

const graph = cellGraph('9x9');

// Column pairs: [outer digit, inner digit] by column 1-9, or null when the
// column carries no outside clue, transcribed from the drawn outside-clue
// digits above each column.
const COLUMN_CLUES = [
  [3, 5], [4, 9], [3, 1], null, [1, 6], [7, 2], [8, 4], [2, 7], [2, 6],
];
// Row pairs: [outer digit, inner digit] by row 1-9, or null when the row
// carries no outside clue, transcribed from the drawn outside-clue digits
// left of each row.
const ROW_CLUES = [
  [4, 8], [8, 2], [1, 7], [8, 2], null, [5, 9], [8, 6], [5, 1], [4, 1],
];

// One NFA per clued row/column, scanning its 9 cells from the clue side
// inward. State: `x` is the value of the first cell (set on the first
// symbol and never changed after); `phase` tracks progress finding `a` then
// `b` (`before` / `after` carries a clamped step count since `a` was seen /
// `done` carries the recorded gap); a `b` seen before `a` is rejected
// outright, enforcing the "given order" clause. Accept only once both are
// found and the recorded gap equals `x`.
function makeDistanceMachine(a, b) {
  const spec = NFA.encodeSpec({
    startState: { x: null, phase: 'before', since: 0, gap: null },
    transition: ({ x, phase, since, gap }, value) => {
      if (x === null) x = value; // first symbol fixes X
      if (phase === 'done') return { x, phase, since, gap };
      if (phase === 'before') {
        if (value === b) return undefined; // b before a: wrong order
        if (value === a) return { x, phase: 'after', since: 0, gap };
        return { x, phase, since, gap };
      }
      // phase === 'after': count cells since a was found; clamp past 9
      // (the longest possible gap on a 9-cell line) since it can only fail.
      const nextSince = Math.min(since + 1, 10);
      if (value === b) return { x, phase: 'done', since: nextSince, gap: nextSince };
      return { x, phase, since: nextSince, gap };
    },
    accept: ({ x, phase, gap }) => phase === 'done' && gap === x,
  }, graph.gridGeometry().numValues);
  return spec;
}

const columnDistances = COLUMN_CLUES.flatMap((pair, i) => {
  if (!pair) return [];
  const [a, b] = pair;
  const machine = makeDistanceMachine(a, b);
  return [new NFA(machine, `col${i + 1}-distance`, ...graph.column(i + 1))];
});

const rowDistances = ROW_CLUES.flatMap((pair, i) => {
  if (!pair) return [];
  const [a, b] = pair;
  const machine = makeDistanceMachine(a, b);
  return [new NFA(machine, `row${i + 1}-distance`, ...graph.row(i + 1))];
});

return [
  new Shape('9x9'),
  ...columnDistances,
  ...rowDistances,
];
