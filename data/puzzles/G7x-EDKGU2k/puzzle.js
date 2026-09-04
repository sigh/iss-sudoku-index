// Title: Broken Heart
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=G7x-EDKGU2k
// Source: https://app.crackingthecryptic.com/sudoku/RMpNq2BgBr

// Star Battle. Rules: place 2 stars in each row, column and region; stars
// cannot be placed in cells that share an edge or a corner (orthogonal or
// diagonal adjacency).
//
// No sudoku digit layer at all -- the payload has no givens and no digit
// rule -- so a grid cell's own value stands for the star directly: 1 marks a
// star, 0 marks an empty cell. The grid uses the Raw type so nothing beyond
// what is built below is enforced (no automatic row/column all-different,
// which a 0/1 alphabet could not satisfy over 10 cells anyway).
//
// Region geometry, transcribed from the drawn jigsaw partition as [row, col]
// pairs (1-indexed): 9 regions were drawn directly; a 10th region was left
// blank by the source. The 14 cells the 9 drawn regions leave uncovered form
// one connected component -- exactly a region's worth -- so they are the
// forced 10th region. REGION_J below is that computed complement, transcribed
// as a literal list.
const cell = (r, c) => makeCellId(r, c);
const region = coords => coords.map(([r, c]) => cell(r, c));

const shape = new Shape('10x10', '0-1', 'Raw');
const graph = cellGraph(shape);

const REGION_A = region([[1, 5], [1, 4], [1, 3], [1, 2], [1, 1], [2, 1], [3, 1], [4, 1], [5, 1]]);
const REGION_B = region([[1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [2, 10], [3, 10], [2, 8], [2, 7], [2, 6], [2, 5]]);
const REGION_C = region([[2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2]]);
const REGION_D = region([[6, 1], [7, 1], [8, 1], [9, 1], [7, 2], [7, 3], [7, 4], [8, 4]]);
const REGION_E = region([[10, 1], [10, 2], [9, 2], [8, 3], [8, 2], [10, 3], [10, 4], [10, 5], [10, 6]]);
const REGION_F = region([[10, 7], [10, 8], [9, 7], [9, 6], [9, 5], [9, 3], [9, 4], [8, 7], [7, 7], [7, 8], [7, 9], [7, 10], [8, 10]]);
const REGION_G = region([[8, 9], [8, 8], [9, 9], [10, 9], [10, 10], [9, 10], [9, 8]]);
const REGION_H = region([[8, 5], [7, 5], [6, 5], [6, 4], [6, 3], [5, 3], [4, 3], [3, 3], [3, 4], [3, 5], [4, 5], [4, 6], [4, 7], [5, 7]]);
const REGION_I = region([[2, 9], [3, 9], [4, 9], [5, 9], [6, 9], [6, 10], [5, 10], [4, 10]]);
// Forced complement of REGION_A..REGION_I (see header): the 14 cells no
// drawn region covers, one connected component.
const REGION_J = region([[3, 6], [3, 7], [3, 8], [4, 4], [4, 8], [5, 4], [5, 5], [5, 6], [5, 8], [6, 6], [6, 7], [6, 8], [7, 6], [8, 6]]);

const REGIONS = [
  REGION_A, REGION_B, REGION_C, REGION_D, REGION_E,
  REGION_F, REGION_G, REGION_H, REGION_I, REGION_J,
];

const NO_STAR = 0;
// Two touching cells cannot both be starred.
const notBothStarred = Pair.fnToKey((a, b) => a === NO_STAR || b === NO_STAR, shape);

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

// Two stars per row, column and region: on a 0/1 alphabet, "sum to 2" is
// exactly "exactly two 1s".
const houses = [...graph.rows(), ...graph.columns(), ...REGIONS];

return [
  shape,
  ...houses.map(house => new Sum(2, ...house)),
  ...noTouchPairs,
];
