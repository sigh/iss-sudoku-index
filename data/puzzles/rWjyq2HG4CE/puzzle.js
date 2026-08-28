// Title: Untitled
// Author: Sed Holaysan
// Video: https://www.youtube.com/watch?v=rWjyq2HG4CE
// Source: https://cracking-the-cryptic.web.app/sudoku/BjMn9Gnfnn

// Normal sudoku rules apply. A marker straddling two orthogonally adjacent
// cells gives the absolute difference between their digits. No rule states
// that every occurrence of a given difference is marked, so only the 18
// drawn pairs are constrained; an unmarked adjacent pair carries no
// difference restriction.

const shape = new Shape('9x9');
const at = (r, c) => makeCellId(r, c);

const givens = [
  [7, 2, 9], [7, 3, 2], [7, 4, 1], [7, 6, 7], [7, 7, 3], [7, 8, 8],
  [8, 4, 3], [8, 6, 9],
].map(([r, c, v]) => new Given(at(r, c), v));

// Difference-1 pairs are exactly the Kropki white-dot relation (values
// consecutive), so they use the native WhiteDot constraint.
const diff1Edges = [
  [[7, 1], [8, 1]], [[8, 2], [9, 2]], [[6, 2], [6, 3]],
  [[2, 3], [2, 4]], [[2, 6], [2, 7]],
];
const diff1 = diff1Edges.map(([a, b]) =>
  new WhiteDot(at(...a), at(...b)));

// Every other drawn difference value gets its own Pair key, one constraint
// per drawn edge (never grouped across differing values or undrawn pairs).
const diffKey = (n) => Pair.fnToKey((a, b) => Math.abs(a - b) === n, shape);
const diffEdges = {
  2: [[[7, 9], [8, 9]], [[8, 8], [9, 8]], [[6, 7], [6, 8]]],
  3: [[[4, 5], [5, 5]]],
  4: [[[2, 9], [3, 9]], [[2, 1], [3, 1]]],
  5: [[[4, 6], [4, 7]], [[4, 3], [4, 4]]],
  6: [[[3, 8], [4, 8]], [[3, 2], [4, 2]]],
  7: [[[3, 3], [3, 4]], [[3, 6], [3, 7]]],
  8: [[[1, 5], [2, 5]]],
};
const diffPairs = Object.entries(diffEdges).flatMap(([n, edges]) => {
  const key = diffKey(+n);
  const name = `difference ${n}`;
  return edges.map(([a, b]) => new Pair(key, name, at(...a), at(...b)));
});

return [shape, ...givens, ...diff1, ...diffPairs];
