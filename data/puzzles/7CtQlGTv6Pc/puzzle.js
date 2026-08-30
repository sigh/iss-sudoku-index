// Title: Greater or Sum Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7CtQlGTv6Pc
// Source: https://cracking-the-cryptic.web.app/sudoku/NhR3GTH7Gh

// Standard sudoku: 9x9 grid, digits 1-9 once per row, column, and 3x3 box
// (the drawn regions are the ordinary consecutive box tiling, so the
// default row/column/box all-different applies).
//
// Rule (video description): a number printed on the border between two
// orthogonally neighbouring cells is either the sum of the two digits or
// the greater of the two digits. Every border mark is independent -- there
// is no rule that every valid edge carries a mark, so only the drawn edges
// below are constrained.

// One [value, cellA, cellB] triple per drawn edge mark (each mark sits on
// the midpoint of the cellA/cellB shared border).
const edgeClues = [
  [3, 'R1C1', 'R1C2'],
  [8, 'R1C1', 'R2C1'],
  [7, 'R1C5', 'R1C6'],
  [7, 'R1C5', 'R2C5'],
  [6, 'R2C4', 'R2C5'],
  [5, 'R2C4', 'R3C4'],
  [8, 'R4C2', 'R4C3'],
  [4, 'R4C2', 'R5C2'],
  [7, 'R5C1', 'R5C2'],
  [5, 'R5C1', 'R6C1'],
  [5, 'R9C4', 'R9C5'],
  [5, 'R8C5', 'R8C6'],
  [3, 'R8C5', 'R9C5'],
  [8, 'R7C6', 'R8C6'],
  [8, 'R4C9', 'R5C9'],
  [8, 'R6C7', 'R6C8'],
  [6, 'R5C8', 'R5C9'],
  [5, 'R5C8', 'R6C8'],
  [7, 'R8C9', 'R9C9'],
  [9, 'R9C8', 'R9C9'],
];

// "Greater or sum": the printed value n is true of a pair (a, b) when it
// equals either their sum or their max. Each edge has its own target n, so
// n is baked into the predicate; one Pair per edge (n varies per clue, so a
// single multi-cell Pair over the whole set would apply the wrong constant
// to every edge but one).
const greaterOrSumKeys = new Map();
function greaterOrSumKey(n) {
  if (!greaterOrSumKeys.has(n)) {
    greaterOrSumKeys.set(
      n, Pair.fnToKey((a, b) => (a + b === n) || (Math.max(a, b) === n), 9));
  }
  return greaterOrSumKeys.get(n);
}

const edgePairs = edgeClues.map(
  ([n, a, b]) => new Pair(greaterOrSumKey(n), `GreaterOrSum ${n}`, a, b));

return [
  new Shape('9x9'),
  new Given('R2C2', 5),
  new Given('R2C8', 4),
  new Given('R5C5', 5),
  new Given('R8C2', 3),
  new Given('R8C8', 5),
  ...edgePairs,
];
