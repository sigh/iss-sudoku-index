// Title: Shush
// Author: HaFlam
// Video: https://www.youtube.com/watch?v=0cLFwxKRDbQ
// Source: https://app.crackingthecryptic.com/sudoku/QPBrmH3qpq

// Normal sudoku (default row/column/box all-different). Three green lines are
// German-whisper lines: adjacent cells differ by >= 5. Grey-shaded cells hold
// a prime digit (2, 3, 5, or 7 -- 1 is excluded by the rules text). Black
// dots mark a 1:2 ratio between the two cells they join, and "all black dots
// are given" is a negative: every other adjacent grid edge must NOT hold a
// 1:2 ratio. There is no white-dot family in this puzzle, so the bundled
// StrictKropki class (which also bans consecutive pairs) does not apply --
// the negative is built directly over the unmarked edges instead.

const graph = cellGraph('9x9');

// Green whisper lines (one continuous drawn stroke each).
const WHISPER_LINES = [
  ['R1C1', 'R2C2', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C2', 'R8C1'],
  ['R2C9', 'R3C8', 'R4C7', 'R5C7', 'R6C7', 'R7C7', 'R8C8', 'R9C9'],
  ['R4C5', 'R5C5', 'R6C5'],
];

// Grey-shaded cells (drawn as 1x1 light-grey fills).
const PRIME_CELLS = [
  'R1C2', 'R1C4', 'R1C6', 'R1C8', 'R2C1', 'R2C4', 'R2C6', 'R2C8',
  'R3C1', 'R3C3', 'R3C7', 'R3C9', 'R4C3', 'R4C5', 'R4C7', 'R4C8',
  'R5C1', 'R5C6', 'R5C7', 'R5C9', 'R6C2', 'R6C3', 'R6C4', 'R6C5',
  'R7C3', 'R7C7', 'R7C8', 'R7C9', 'R8C2', 'R8C4', 'R8C5', 'R8C9',
  'R9C1', 'R9C2', 'R9C5', 'R9C6',
];

// Black-dot edges (small rounded black marks centred on a shared cell edge).
const BLACK_DOT_EDGES = [
  ['R1C5', 'R1C6'], ['R2C1', 'R2C2'], ['R2C8', 'R2C9'], ['R3C4', 'R4C4'],
  ['R3C5', 'R4C5'], ['R3C8', 'R3C9'], ['R5C2', 'R5C3'], ['R5C8', 'R5C9'],
  ['R6C5', 'R7C5'], ['R6C7', 'R6C8'], ['R6C8', 'R7C8'], ['R7C1', 'R8C1'],
  ['R8C2', 'R8C3'], ['R9C2', 'R9C3'], ['R9C6', 'R9C7'], ['R9C8', 'R9C9'],
];

const whispers = WHISPER_LINES.map(cells => new Whisper(5, ...cells));

const primes = PRIME_CELLS.map(cell => new Given(cell, 2, 3, 5, 7));

const blackDots = BLACK_DOT_EDGES.map(([a, b]) => new BlackDot(a, b));

// Dotless edges = every grid adjacency minus the dotted list above, split by
// direction: each direction is one uniform shift, so it becomes one
// Replicate template (both directions' shift from R1C1 is itself dotless,
// so R1C1 can serve as the template origin) instead of one Pair per edge.
const dottedKeys = new Set(
  BLACK_DOT_EDGES.map(([a, b]) => [a, b].sort().join('-'))
);
const hOrigins = [];
const vOrigins = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (c < 9) {
      const right = makeCellId(r, c + 1);
      if (!dottedKeys.has([cell, right].sort().join('-'))) hOrigins.push(cell);
    }
    if (r < 9) {
      const below = makeCellId(r + 1, c);
      if (!dottedKeys.has([cell, below].sort().join('-'))) vOrigins.push(cell);
    }
  }
}

const notRatio2 = Pair.fnToKey((a, b) => a !== b * 2 && b !== a * 2, 9);
const negatedDots = [
  graph.makeReplicate(
    [new Pair(notRatio2, 'not 1:2 ratio', 'R1C1', 'R1C2')], hOrigins),
  graph.makeReplicate(
    [new Pair(notRatio2, 'not 1:2 ratio', 'R1C1', 'R2C1')], vOrigins),
];

return [
  new Shape('9x9'),
  ...whispers,
  ...primes,
  ...blackDots,
  ...negatedDots,
];
