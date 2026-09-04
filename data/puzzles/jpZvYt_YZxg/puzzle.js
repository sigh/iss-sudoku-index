// Title: Star Battle
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=jpZvYt_YZxg
// Source: https://cracking-the-cryptic.web.app/sudoku/BQ2jdQQgT8

// A Star Battle: place exactly three stars in every row, every column and
// every bordered region so that no two stars touch, not even diagonally.
// Not a Sudoku -- there are no digits, so a cell is either starred (1) or
// empty (0) on a Raw grid, which carries no implicit row/column/box rule.
//
// The payload carries no other geometry: no givens, no cages, lines or
// symbols -- the region borders are the puzzle's only clue. The payload's
// own `regions` array lists only 14 of the 15 regions, covering 212 of the
// 225 cells; the remaining 13 cells form a single orthogonally-connected
// block, so per the forced-complement rule (exactly one region's worth of
// cells left uncovered) that block is the fifteenth region.

const shape = new Shape('15x15', '0-1', 'Raw');
const graph = cellGraph(shape);

// The 15 irregular regions, transcribed from the source payload's `regions`
// array (0-indexed pairs there, +1 here for makeCellId); the last entry is
// the forced complement the payload itself does not list.
const REGION_COORDS = [
  [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [2, 4], [3, 1], [3, 2], [3, 3]],
  [[1, 6], [2, 6], [3, 6], [1, 5], [4, 6], [5, 6]],
  [[1, 11], [1, 12], [1, 13], [1, 14], [1, 15], [2, 12], [2, 13], [2, 14], [2, 15], [3, 13], [3, 14], [3, 15]],
  [[4, 1], [4, 2], [5, 1], [5, 2], [5, 3], [5, 4], [6, 1], [7, 1], [8, 1], [9, 1], [9, 2], [9, 3], [10, 1], [11, 1], [12, 1], [12, 2], [11, 2]],
  [[1, 7], [2, 7], [2, 8], [2, 9], [3, 7], [4, 7], [5, 7], [6, 7], [6, 8], [6, 9], [7, 9], [8, 9], [8, 10], [9, 10], [10, 10], [10, 9], [11, 10], [12, 10], [12, 9], [12, 8], [13, 10], [14, 10], [15, 10], [15, 11], [14, 11], [13, 11], [13, 12], [12, 12], [12, 13], [11, 13]],
  [[4, 13], [4, 14], [4, 15], [5, 12], [5, 13], [5, 14], [5, 15], [6, 15], [7, 15], [8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [12, 14], [11, 14]],
  [[2, 5], [3, 5], [3, 4], [4, 3], [4, 4], [4, 5], [5, 5], [6, 5], [6, 6], [7, 5], [7, 6], [7, 7], [8, 7], [8, 6], [8, 5], [9, 5], [10, 5], [10, 6], [10, 7], [11, 5], [11, 4], [11, 3], [11, 6], [12, 6], [12, 5], [12, 4], [12, 3], [13, 4], [13, 5], [13, 6], [14, 5], [14, 6], [15, 5], [15, 6]],
  [[7, 8], [8, 8], [9, 8], [9, 9], [9, 7], [9, 6], [10, 8]],
  [[6, 12], [6, 13], [6, 14], [7, 14], [8, 14], [8, 13], [8, 12], [9, 14], [10, 14], [10, 13], [10, 12]],
  [[13, 1], [14, 1], [15, 1], [15, 2], [14, 2], [13, 2], [13, 3], [14, 3], [15, 3], [15, 4], [14, 4]],
  [[11, 9], [11, 8], [11, 7], [12, 7], [13, 7], [14, 7], [15, 7], [15, 8], [14, 8], [13, 8], [13, 9], [14, 9], [15, 9]],
  [[13, 14], [14, 14], [15, 14], [15, 15], [14, 15], [13, 15], [13, 13], [14, 13], [15, 13], [14, 12], [15, 12]],
  [[1, 8], [1, 9], [1, 10], [2, 10], [3, 10], [3, 9], [3, 8], [4, 8], [5, 8], [5, 9], [5, 10]],
  [[2, 11], [3, 11], [3, 12], [4, 12], [4, 11], [4, 9], [4, 10], [5, 11], [6, 11], [6, 10], [7, 10], [7, 11], [7, 12], [7, 13], [8, 11], [9, 11], [9, 12], [9, 13], [10, 11], [11, 11], [12, 11], [11, 12]],
  // Forced complement: the 13 cells left uncovered by the 14 regions above.
  [[6, 2], [6, 3], [6, 4], [7, 2], [7, 3], [7, 4], [8, 2], [8, 3], [8, 4], [9, 4], [10, 2], [10, 3], [10, 4]],
];
const REGIONS = REGION_COORDS.map(
  region => region.map(([row, col]) => makeCellId(row, col)));

const UNSTARRED = 0;
// The value alphabet is only {0, 1}, so requiring exactly three 1s already
// forces every other cell in the house to 0 -- rows and columns have 15
// cells, but regions vary in size (6-34), so an explicit 0 count would be
// wrong for them.
const THREE_STARRED = '1_1_1';

const houses = [...graph.rows(), ...graph.columns(), ...REGIONS];

// Two king-move-adjacent cells cannot both be starred.
const notBothStarred = Pair.fnToKey(
  (a, b) => a === UNSTARRED || b === UNSTARRED, shape);

// One offset per unordered king-move adjacency, so each touching pair is
// constrained once.
const TOUCHING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];

const noTouchPairs = TOUCHING_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const anchor = origins[0];
  const template = new Pair(
    notBothStarred, 'stars do not touch',
    anchor, graph.step(anchor, dr, dc));
  return new Replicate(
    [template],
    Replicate.encodeTargetCells(origins, anchor, graph),
    anchor);
});

return [
  shape,
  ...houses.map(house => new ContainExact(THREE_STARRED, ...house)),
  ...noTouchPairs,
];
