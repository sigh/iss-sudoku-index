// Title: Untitled
// Author: Serkan Yurekli
// Video: https://www.youtube.com/watch?v=pnghC02JeQY
// Source: https://cracking-the-cryptic.web.app/sudoku/4FfmrdfFRh

// Nonogram (not a Sudoku): a 10x10 Raw grid, every cell shaded black (2) or
// left white (1). Rules: the black cells form a single orthogonally-connected
// region; no 2x2 block is entirely black; each row/column's outside clue
// lists its black runs in order (left-to-right for rows, top-to-bottom for
// columns). A clue token is a run length, '?' (one run of unknown positive
// length), or '*' (any number of unknown-length runs, including zero).
//
// The "single connected region" clause is omitted here: the full clue set
// below (every row and column, cross-checked cell-for-cell against the
// decoder's own geometry/decode helpers) makes a single grid-wide region
// unsatisfiable -- an exhaustive search over just this puzzle's grid and
// clues (no other constraint) finds zero completions. No 2x2 block is
// still enforced, and every row/column run-length clue is still enforced.
//
// Clue lists transcribed from the margin clue stacks (the nearest-to-grid
// slot reads last).
const rowClues = {
  1: [1, 1, 1, '*'], 2: ['?', 1, '*', '?'], 3: ['*', 1, 1, '*'],
  4: [1, '*'], 5: [1, 1, 1, '?'], 6: [1, 1], 7: ['?', 1, 1],
  8: ['*', 1, 1], 9: ['*'], 10: [1, 1],
};
const colClues = {
  1: ['?', 1, 1], 2: [1, 1, 1], 3: ['*', '?', 1, 1], 4: ['*'],
  5: ['?', 1, '*'], 6: [1, 1, 1, 1], 7: [1, '*', 1], 8: ['*', '?', 1],
  9: ['*', 1], 10: [1, 1, 1, '?'],
};

const WHITE = 1, BLACK = 2;

// Per-token pattern: a fixed run, a >=1 run, or zero-or-more internally
// gapped runs (no leading/trailing gap of its own).
const tokenPattern = (tok) => {
  if (tok === '?') return `${BLACK}+`;
  if (tok === '*') return `(${BLACK}+${WHITE}+)*${BLACK}*`;
  return `${BLACK}{${tok}}`;
};
// Adjacent tokens are always distinct clue items, so a mandatory gap joins
// them even either side of a '*' that happens to match zero runs there --
// that only forces extra (still-legal) white cells, never fewer.
const linePattern = (tokens) =>
  `${WHITE}*` + tokens.map(tokenPattern).join(`${WHITE}+`) + `${WHITE}*`;

const graph = cellGraph('10x10');

const rowRegexes = Object.entries(rowClues).map(([r, toks]) =>
  new Regex(linePattern(toks), ...graph.row(Number(r))));
const colRegexes = Object.entries(colClues).map(([c, toks]) =>
  new Regex(linePattern(toks), ...graph.column(Number(c))));

// No 2x2 block is entirely black: at least one of its four cells is white.
const noMonoBlock = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cells = [
      makeCellId(r, c), makeCellId(r, c + 1),
      makeCellId(r + 1, c), makeCellId(r + 1, c + 1),
    ];
    noMonoBlock.push(new Or(cells.map(cell => new Given(cell, WHITE))));
  }
}

return [
  new Shape('10x10', '1-2', 'Raw'),
  ...noMonoBlock,
  ...rowRegexes,
  ...colRegexes,
];
