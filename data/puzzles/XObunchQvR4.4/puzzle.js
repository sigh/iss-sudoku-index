// Title: 3 Star Battle
// Author: Maho Yokota
// Video: https://www.youtube.com/watch?v=XObunchQvR4
// Source: https://tinyurl.com/ycuhgous

// A Star Battle: place exactly three stars in every row, every column and
// every bordered region so that no two stars touch, not even diagonally.
// Not a Sudoku -- there are no digits, so a cell is either starred (1) or
// empty (0) on a Raw grid, which carries no implicit row/column/box rule.
//
// The payload carries no other geometry: no givens, no cages, lines or
// symbols -- the 15 region borders are the puzzle's only clue.

const shape = new Shape('15x15', '0-1', 'Raw');
const graph = cellGraph(shape);

// The 15 irregular regions, transcribed from the drawn region-border edges
// via flood fill, as [row, col] pairs; listed in reading order of each
// region's top-left cell. Built with makeCellId since rows/columns run past
// 9 here (row/col 10-15 are the base-17 digits 'a'-'f' in a cell id).
const REGION_COORDS = [
  [[1, 1], [1, 2], [1, 3], [1, 4], [1, 5], [2, 1], [2, 3], [2, 5], [3, 1], [3, 3], [3, 5], [4, 1], [4, 3], [4, 5], [5, 1], [5, 3], [5, 5], [6, 1], [6, 3], [6, 5], [7, 1], [7, 3], [7, 5]],
  [[1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [3, 10], [3, 11], [4, 11], [5, 11], [6, 11], [7, 10], [7, 11]],
  [[1, 12], [1, 13], [1, 14], [1, 15], [2, 13], [2, 14], [2, 15], [3, 13], [3, 14], [3, 15], [4, 14], [5, 14], [6, 14]],
  [[2, 2], [3, 2], [4, 2], [5, 2], [6, 2], [7, 2], [8, 1], [8, 2], [9, 1], [10, 1], [10, 2]],
  [[2, 4], [3, 4], [4, 4], [5, 4], [6, 4], [7, 4], [7, 6], [8, 4], [8, 5], [8, 6], [9, 4], [10, 4]],
  [[2, 12], [3, 12], [4, 12], [4, 13], [4, 15], [5, 13], [5, 15], [6, 13], [6, 15], [7, 13], [7, 14], [7, 15], [8, 15]],
  [[3, 6], [3, 7], [3, 8], [3, 9], [4, 6], [4, 7], [4, 8], [4, 9], [4, 10], [5, 6], [6, 6], [6, 7]],
  [[5, 7], [5, 8], [5, 9], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8], [11, 7], [11, 8], [11, 9]],
  [[5, 10], [5, 12], [6, 9], [6, 10], [6, 12], [7, 9], [7, 12], [8, 9], [8, 10], [8, 11], [8, 12], [8, 13], [8, 14]],
  [[7, 7], [8, 7], [9, 5], [9, 6], [9, 7], [10, 5], [10, 6], [10, 7], [11, 5], [11, 6], [12, 5], [12, 6]],
  [[8, 3], [9, 2], [9, 3], [10, 3], [11, 3], [11, 4], [12, 2], [12, 3], [12, 4], [13, 4], [13, 5], [13, 6], [14, 4], [14, 5], [14, 6], [14, 7], [14, 8]],
  [[9, 9], [9, 10], [10, 9], [10, 10], [11, 10], [12, 7], [12, 8], [12, 9], [12, 10], [13, 7], [13, 8]],
  [[9, 11], [9, 12], [9, 13], [9, 14], [9, 15], [10, 11], [10, 15], [11, 11], [11, 15], [12, 11], [12, 15], [13, 11], [13, 15], [14, 11], [14, 15], [15, 11], [15, 12], [15, 13], [15, 14], [15, 15]],
  [[10, 12], [10, 13], [10, 14], [11, 12], [11, 13], [11, 14], [12, 12], [12, 13], [12, 14], [13, 12], [13, 13], [13, 14], [14, 12], [14, 13], [14, 14]],
  [[11, 1], [11, 2], [12, 1], [13, 1], [13, 2], [13, 3], [13, 9], [13, 10], [14, 1], [14, 2], [14, 3], [14, 9], [14, 10], [15, 1], [15, 2], [15, 3], [15, 4], [15, 5], [15, 6], [15, 7], [15, 8], [15, 9], [15, 10]],
];
const REGIONS = REGION_COORDS.map(
  region => region.map(([row, col]) => makeCellId(row, col)));

const UNSTARRED = 0;
// The value alphabet is only {0, 1}, so requiring exactly three 1s already
// forces every other cell in the house to 0 -- rows and columns have 15
// cells, but regions vary in size (11-23), so an explicit 0 count would be
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
