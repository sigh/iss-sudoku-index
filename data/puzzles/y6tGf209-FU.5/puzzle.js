// Title: Dot You (Forget About Me)
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=y6tGf209-FU
// Source: https://tinyurl.com/3de6kdpx

// Normal sudoku rules apply. A black dot between two orthogonally adjacent
// cells is labelled with a ratio N: one of the two digits is N times the
// other. "Not all dots are given" means unmarked pairs are unconstrained --
// no exhaustive negative is encoded. Ratio-2 dots are the native BlackDot
// relation; other ratios use a generic Pair.

// Dot cells and ratio values transcribed from the payload's `ratio` array.
const dots = [
  ['R1C1', 'R1C2', 2],
  ['R1C2', 'R2C2', 3],
  ['R2C2', 'R2C3', 4],
  ['R3C2', 'R3C3', 5],
  ['R3C3', 'R4C3', 6],
  ['R9C9', 'R9C8', 2],
  ['R8C8', 'R9C8', 3],
  ['R8C7', 'R8C8', 4],
  ['R7C8', 'R7C7', 5],
  ['R6C7', 'R7C7', 6],
  ['R5C4', 'R5C3', 2],
  ['R5C4', 'R6C4', 3],
  ['R2C8', 'R1C8', 3],
  ['R2C9', 'R2C8', 3],
  ['R8C1', 'R8C2', 3],
  ['R8C2', 'R9C2', 3],
  ['R5C7', 'R5C6', 2],
  ['R4C6', 'R5C6', 2],
  ['R2C7', 'R2C6', 7],
  ['R8C4', 'R8C3', 7],
  ['R2C6', 'R3C6', 9],
  ['R8C4', 'R7C4', 9],
  ['R4C9', 'R5C9', 5],
  ['R6C1', 'R5C1', 5],
];

// Ratio-N Pair: one digit is N times the other, keyed per ratio value.
// Ratio 2 is the native BlackDot relation; every other ratio value uses a
// generic Pair.
const ratioKey = n => Pair.fnToKey((a, b) => a === n * b || b === n * a, 9);

return [
  new Shape('9x9'),
  ...dots.map(([a, b, n]) => n === 2
    ? new BlackDot(a, b)
    : new Pair(ratioKey(n), `ratio ${n}`, a, b)),
];
