// Title: Difference Sudoku 06
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=xah3yKK0vh8
// Source: https://app.crackingthecryptic.com/sudoku/b4qLdjD8LP

// Normal sudoku rules apply (standard 9x9 grid, rows/columns/boxes). The
// circled number between two cells is the absolute difference of the two
// cells' digits.

const at = (r, c) => makeCellId(r, c);

const givens = [
  [1, 1, 8], [2, 2, 7], [3, 3, 6], [4, 4, 5], [5, 5, 9],
  [6, 6, 4], [7, 7, 3], [8, 8, 2], [9, 9, 1],
].map(([r, c, v]) => new Given(at(r, c), v));

// Difference circles, keyed by the printed number (overlay text). Each entry
// is one circle: [difference, cellA, cellB].
const diffCircles = [
  [1, [1, 8], [1, 9]],
  [1, [9, 1], [9, 2]],
  [2, [8, 1], [9, 1]],
  [2, [1, 9], [2, 9]],
  [2, [2, 8], [2, 9]],
  [3, [2, 3], [2, 4]],
  [4, [8, 1], [8, 2]],
  [4, [5, 6], [5, 7]],
  [4, [3, 4], [3, 5]],
  [5, [4, 5], [4, 6]],
  [5, [7, 8], [7, 9]],
  [6, [7, 5], [7, 6]],
  [6, [5, 3], [5, 4]],
  [3, [6, 4], [6, 5]],
  [7, [8, 6], [8, 7]],
  [7, [6, 7], [6, 8]],
  [7, [4, 2], [4, 3]],
  [8, [3, 1], [3, 2]],
];

// Difference-1 circles are exactly Kropki's white dot; use the native class.
// The rest need a custom exact-difference relation, one binary key per
// distinct difference value shared across all circles with that number.
const keyForDiff = {};
for (const [n] of diffCircles) {
  if (n !== 1 && !(n in keyForDiff)) {
    keyForDiff[n] = Pair.fnToKey((a, b) => Math.abs(a - b) === n, 9);
  }
}

const diffMarks = diffCircles.map(([n, a, b]) =>
  n === 1
    ? new WhiteDot(at(...a), at(...b))
    : new Pair(keyForDiff[n], `difference ${n}`, at(...a), at(...b)));

return [
  new Shape('9x9'),
  ...givens,
  ...diffMarks,
];
