// Title: Dec. 28, 2022: Sum Next to 9
// Author: clover!
// Video: https://www.youtube.com/watch?v=EIVLk0zoBt8
// Source: https://tinyurl.com/yr5behew

// Normal sudoku rules apply. Each outside clue gives the sum of the digit(s)
// orthogonally touching the 9 in that row/column, read from the clue's side:
// row clues scan the row left-to-right from C1, column clues scan the column
// top-to-bottom from R1. A 9 that lands on the line's first cell in that scan
// has only one neighbour (the next cell); otherwise both neighbours are
// summed. Only the printed clues are enforced -- rows 4 and 6, and columns 3
// and 7, have no outside clue and so carry no rule from this text beyond
// normal sudoku.

// One NFA per outside clue scans its row/column for the 9 and compares the
// sum of its orthogonal neighbour(s) to the clue's target. States:
// - {phase:'start'}: no digits seen yet.
// - {phase:'prev', digit}: last non-9 digit seen, a candidate left neighbour.
// - {phase:'found9', left}: the 9 was just seen; `left` is the prior digit,
//   or null if the 9 was the scan's first cell (no left neighbour).
// - {phase:'checked', ok}: the neighbour sum has already been compared to
//   the target; remaining cells don't matter to this clue, so this state
//   self-loops for the rest of the line.
// `accept` covers both endings: if the line finishes in 'checked', its `ok`
// flag decides; if it finishes in 'found9' (the 9 was the scan's last cell),
// the lone left neighbour must equal the target directly.
const touchingNineSpec = (target) => NFA.encodeSpec({
  startState: { phase: 'start' },
  transition: (state, value) => {
    if (state.phase === 'start') {
      return value === 9
        ? { phase: 'found9', left: null }
        : { phase: 'prev', digit: value };
    }
    if (state.phase === 'prev') {
      return value === 9
        ? { phase: 'found9', left: state.digit }
        : { phase: 'prev', digit: value };
    }
    if (state.phase === 'found9') {
      const sum = state.left === null ? value : state.left + value;
      return { phase: 'checked', ok: sum === target };
    }
    return state; // phase 'checked': sink.
  },
  accept: (state) =>
    state.phase === 'checked' ? state.ok : state.left === target,
}, 9);

const row = (r) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const col = (c) => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));

// Row clues, printed left of the grid (row -> target).
const rowClues = { 1: 3, 2: 3, 3: 1, 5: 3, 7: 2, 8: 4, 9: 12 };
// Column clues, printed above the grid (column -> target).
const colClues = { 1: 6, 2: 7, 4: 5, 5: 5, 6: 2, 8: 6, 9: 6 };

const rowNFAs = Object.entries(rowClues).map(([r, target]) =>
  new NFA(touchingNineSpec(target), 'row-touch-9', ...row(Number(r))));
const colNFAs = Object.entries(colClues).map(([c, target]) =>
  new NFA(touchingNineSpec(target), 'col-touch-9', ...col(Number(c))));

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C7', 7),
  new Given('R1C9', 5),
  new Given('R2C2', 9),
  new Given('R4C4', 4),
  new Given('R5C2', 5),
  new Given('R5C8', 6),
  new Given('R6C6', 5),
  new Given('R8C8', 9),
  new Given('R9C1', 6),
  new Given('R9C3', 5),

  ...rowNFAs,
  ...colNFAs,
];
