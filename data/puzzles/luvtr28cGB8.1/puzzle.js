// Title: Killer Renban
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=luvtr28cGB8
// Source: https://app.crackingthecryptic.com/sudoku/PPRRg3M2P8

// Normal sudoku rules apply (standard rows/cols/3x3 boxes, from Shape('9x9')).
// Cages: digits in a cage are distinct and sum to the cage total -- Cage
// bakes in the distinctness, matching "must be distinct and add up to".
// Purple lines: the two digits a purple line connects must be consecutive.
// Each drawn purple line joins exactly two specific cell centers (some
// diagonally adjacent, not just orthogonally), so the built-in WhiteDot
// class (which requires grid/orthogonal adjacency) does not fit every one;
// Pair with a hand-built consecutive predicate covers both cases uniformly.

const shape = new Shape('9x9');
const at = (r, c) => makeCellId(r, c);

const givens = [
  new Given(at(5, 5), 6),
  new Given(at(6, 5), 9),
];

// Cages: [sum, ...cells], one row per drawn cage outline.
const cages = [
  [7, [2, 2], [2, 3]],
  [10, [3, 4], [3, 5], [3, 6], [4, 5]],
  [14, [2, 7], [2, 8]],
  [12, [3, 9], [4, 9]],
  [13, [5, 8], [5, 9]],
  [3, [6, 7], [6, 8]],
  [11, [7, 6], [7, 7]],
  [13, [3, 1], [4, 1]],
  [3, [5, 1], [5, 2]],
  [8, [6, 2], [6, 3]],
  [13, [7, 3], [7, 4]],
  [10, [8, 4], [8, 5], [8, 6], [9, 5]],
].map(([sum, ...cells]) => new Cage(sum, ...cells.map(rc => at(...rc))));

// Purple consecutive-pair lines: each is a single drawn segment joining two
// specific cells. A generic pairwise relation is needed because several
// pairs are diagonally adjacent, which WhiteDot's built-in grid-adjacency
// check rejects.
const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, shape);
const purpleLines = [
  [[2, 8], [3, 9]],
  [[4, 9], [5, 9]],
  [[6, 8], [7, 7]],
  [[8, 6], [9, 5]],
  [[8, 4], [7, 3]],
  [[6, 2], [5, 1]],
  [[4, 1], [3, 1]],
  [[2, 2], [2, 3]],
  [[3, 4], [4, 5]],
  [[3, 6], [2, 7]],
].map(([a, b]) => new Pair(
  consecutiveKey, 'purple consecutive', at(...a), at(...b)));

return [shape, ...givens, ...cages, ...purpleLines];
