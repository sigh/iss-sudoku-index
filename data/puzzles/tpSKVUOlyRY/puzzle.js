// Title: Star Battle Sudoku ("Christmas Tree")
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=tpSKVUOlyRY
// Source: https://gmpuzzles.com/s/181225XMas

// Rules (from the posting page): "Classic Sudoku rules, with the digits 1-7
// and two stars to be placed in each row, column, and bold region. As in Star
// Battle puzzles, the stars cannot be placed in adjacent cells that share an
// edge or corner."
//
// Every cell holds either a digit 1-7 or a star, so the board is a Raw grid
// (no implicit latin rules) with domain 0-7, where 0 stands for a star. Each
// house -- row, column, bold region -- holds 1-7 once each and exactly two
// stars: one ContainExact pinning the house to the multiset {0,0,1,...,7}.
// The bold regions are the standard 3x3 boxes, drawn as edge walls between
// columns 3|4 and 6|7 and rows 3|4 and 6|7. A Raw grid has no default boxes,
// so they are built explicitly. The no-touch clause is one Pair per king-move
// adjacency. No rule is omitted.

const shape = new Shape('9x9', '0-7', 'Raw');
const graph = cellGraph(shape);

const STAR = 0;
const HOUSE_MULTISET = '0_0_1_2_3_4_5_6_7';

const boxTopLefts = [1, 4, 7].flatMap(
  r => [1, 4, 7].map(c => makeCellId(r, c)));
const boxes = boxTopLefts.map(tl => graph.block(tl, 3, 3));
const houses = [...graph.rows(), ...graph.columns(), ...boxes];

// Givens -- provenance: the 22 printed digits and the one printed star
// (R1C5) in the puzzle layer, as [row, col, value].
const GIVEN_DIGITS = [
  [1, 1, 1], [1, 2, 2],
  [2, 5, 6], [2, 8, 2], [2, 9, 5],
  [3, 4, 7], [3, 6, 2],
  [4, 4, 2], [4, 6, 6],
  [5, 3, 5], [5, 7, 7],
  [6, 3, 6], [6, 7, 2],
  [7, 2, 5], [7, 8, 3],
  [8, 2, 1], [8, 3, 2], [8, 4, 3], [8, 6, 4], [8, 7, 5], [8, 8, 6],
  [9, 5, 5],
];
const GIVEN_STARS = [[1, 5]];

// One template Pair per unordered adjacency offset (right, down, down-right,
// down-left), replicated onto every cell that has a neighbour at that offset,
// so each touching pair is constrained exactly once.
const notBothStar = Pair.fnToKey((a, b) => a !== STAR || b !== STAR, shape);
const TOUCHING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouchPairs = TOUCHING_OFFSETS.map(([dr, dc]) => {
  const origins = graph.cells().filter(cell => graph.step(cell, dr, dc));
  const anchor = origins[0];
  const template = new Pair(
    notBothStar, 'stars do not touch', anchor, graph.step(anchor, dr, dc));
  return new Replicate(
    [template], Replicate.encodeTargetCells(origins, anchor, graph), anchor);
});

return [
  shape,
  ...GIVEN_DIGITS.map(([r, c, d]) => new Given(makeCellId(r, c), d)),
  ...GIVEN_STARS.map(([r, c]) => new Given(makeCellId(r, c), STAR)),
  ...houses.map(house => new ContainExact(HOUSE_MULTISET, ...house)),
  ...noTouchPairs,
];
