// Title: July 10, 2023: Caterpillars
// Author: clover!
// Video: https://www.youtube.com/watch?v=-SbL3gEtxaM
// Source: https://tinyurl.com/4d583p9v

// Normal sudoku rules apply.
//
// Entropic lines: along each line, every set of three contiguous digits
// includes one low (1-3), one medium (4-6), and one high (7-9) digit -- the
// ISS `Entropic` class's exact semantics (sliding window of 3 by list order).
// Each of the 9 rows is drawn as one such line (the puzzle's "caterpillars"),
// rendered left-to-right on odd rows and right-to-left on even rows; a
// sliding window over 3 consecutive cells covers the same cell sets in
// either direction, so direction does not change the constraint.
//
// White dot = consecutive (WhiteDot), black dot = 1:2 ratio (BlackDot); dots
// are drawn with no explicit value override, so both take the rules' default
// reading. Not all possible dots are given -- absence of a dot is not a clue.

const GIVENS = [
  ['R1C1', 3], ['R2C9', 8], ['R3C1', 6], ['R4C9', 4], ['R5C1', 7],
  ['R6C9', 6], ['R7C1', 4], ['R8C9', 2], ['R9C1', 2],
];

// Entropic line per row; cell order does not affect the constraint (see above).
const entropicRows = [1, 2, 3, 4, 5, 6, 7, 8, 9].map(
  r => new Entropic(...[1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c))));

// White dots (consecutive), from the `difference` array.
const whiteDots = [
  ['R1C1', 'R1C2'], ['R3C1', 'R3C2'], ['R5C1', 'R5C2'], ['R7C1', 'R7C2'],
].map(([a, b]) => new WhiteDot(a, b));

// Black dots (1:2 ratio), from the `ratio` array.
const blackDots = [
  ['R4C8', 'R4C9'], ['R6C8', 'R6C9'], ['R8C8', 'R8C9'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...entropicRows,
  ...whiteDots,
  ...blackDots,
];
