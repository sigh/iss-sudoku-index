// Title: Miracles Are All Very Well, The Impossible Takes Longer!
// Author: Osh Tirola
// Video: https://www.youtube.com/watch?v=CjerUUtEm80
// Source: https://cracking-the-cryptic.web.app/sudoku/M8nf3Q7DJb

// Normal sudoku. In each row/column/box, exactly two cells are shaded as
// "stars"; no two shaded cells may be a king's move apart (including
// diagonally). Outside clues give the sum of the two starred digits in
// their row/column. Digits 4 and 6 cannot occupy king-move-adjacent cells,
// including two 4s, two 6s, or a 4 next to a 6.
//
// Star shading is solver-discovered state, so it needs a parallel Var
// overlay. Per cell the overlay VS holds the digit when that cell is
// starred, 0 otherwise. That makes "exactly two stars per house" a
// zero-count (ContainExact) on the overlay, and "sum of the starred digits"
// a plain Sum over the overlay -- no NFA needed.

const shape = new Shape('9x9', '0-9');
const graph = cellGraph(shape);
const cells = graph.cells();

// Grid cells only ever hold real sudoku digits 1-9; 0 is reserved for the
// unstarred overlay cells.
const gridRange = graph.makeReplicate(
  new Given(cells[0], 1, 2, 3, 4, 5, 6, 7, 8, 9));

const star = graph.makeOverlay('VS');

// A star cell's overlay value must be either 0 (unstarred) or equal to its
// own grid digit (starred); this is what ties "digit-or-0" to the real
// digit at each cell. Each instance spans the main grid and the VS overlay
// -- two different cell groups -- so Replicate (which only shifts within one
// group) cannot collapse these; one Pair per cell.
const starTieKey = Pair.fnToKey((digit, v) => v === 0 || v === digit, shape);
const starTies = cells.map(
  cell => new Pair(starTieKey, 'star value or zero', cell, star.at(cell)));

// Exactly two stars per row/column/box == exactly seven zeros among the
// nine overlay cells of that house.
const sevenZeros = Array(7).fill(0).join('_');
const starCounts = star.rowsColumnsBoxes().map(
  house => new ContainExact(sevenZeros, ...house));

// Outside clues: sum of the row's/column's two starred digits (zero cells
// contribute nothing).
const rowSums = [15, 3, 11, 10, 15, 13, 14, 14, 7];
const colSums = [15, 14, 15, 7, 13, 16, 10, 5, 7];
const rowSumClues = rowSums.map(
  (total, i) => new Sum(total, ...star.row(i + 1)));
const colSumClues = colSums.map(
  (total, i) => new Sum(total, ...star.column(i + 1)));

// Every king-move-adjacent (unordered) pair of grid cells, grouped by the one
// of the 4 basic offsets (right, down, down-right, down-left) that reaches
// the second cell from the first -- covers every undirected king edge
// exactly once, and lets each group replicate as one shifted template.
const KING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const kingOffsetGroups = KING_OFFSETS.map(([dRow, dCol]) => ({
  dRow, dCol,
  origins: cells.filter(cell => graph.step(cell, dRow, dCol) !== null),
}));

// No two king-adjacent cells are both starred.
const starTouchKey = Pair.fnToKey((a, b) => a === 0 || b === 0, shape);
const starNonTouching = kingOffsetGroups.map(({ dRow, dCol, origins }) => {
  const anchor = star.at(origins[0]);
  const partner = star.at(graph.step(origins[0], dRow, dCol));
  return new Replicate(
    [new Pair(starTouchKey, 'stars non-touching', anchor, partner)],
    Replicate.encodeTargetCells(star.at(origins), anchor, star),
    anchor);
});

// Digits 4 and 6 can't occupy king-adjacent cells -- with each other or with
// themselves.
const noFourSixTouchKey = Pair.fnToKey(
  (a, b) => !((a === 4 || a === 6) && (b === 4 || b === 6)), shape);
const fourSixNonTouching = kingOffsetGroups.map(({ dRow, dCol, origins }) => {
  const anchor = origins[0];
  const partner = graph.step(anchor, dRow, dCol);
  return new Replicate(
    [new Pair(noFourSixTouchKey, '4/6 non-touching', anchor, partner)],
    Replicate.encodeTargetCells(origins, anchor, graph),
    anchor);
});

return [
  shape,
  gridRange,
  star.toVar('star value (digit if starred, else 0)'),
  ...starTies,
  ...starCounts,
  ...rowSumClues,
  ...colSumClues,
  ...starNonTouching,
  ...fourSixNonTouching,
];
