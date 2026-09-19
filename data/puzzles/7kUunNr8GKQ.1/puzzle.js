// Title: Star Battle
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7kUunNr8GKQ
// Source: http://pzv.jp/p.html?starbattle/9/9/2/iac3l19k6l12k4g0opiajfe66a9gc0

// Star Battle: every row, column and region holds exactly two stars, and no
// two stars -- not even diagonally -- touch. The grid carries no digits, so
// each cell is a 0/1 flag (1 = star) on a Raw grid with no implicit rules;
// row/column/region counts and the no-touch rule are all stated explicitly
// below. The nine irregular regions are the puzzle's own drawn partition.

const shape = new Shape('9x9', '0-1', 'Raw');
const graph = cellGraph(shape);
const at = (r, c) => makeCellId(r, c);

const regions = [
  [[1, 1], [1, 5], [1, 6], [1, 7], [2, 1], [2, 5], [3, 1], [3, 2], [3, 3],
   [3, 5], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [5, 4], [6, 4]], // A
  [[1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4], [3, 4]], // B
  [[1, 8], [1, 9], [2, 6], [2, 7], [2, 8], [2, 9], [3, 8], [3, 9], [4, 9],
   [5, 7], [5, 8], [5, 9], [6, 9]], // C
  [[3, 6], [3, 7], [4, 7], [4, 8]], // D
  [[4, 1], [5, 1], [5, 2], [5, 3]], // E
  [[5, 5], [5, 6], [6, 5], [6, 6], [7, 3], [7, 4], [7, 5], [7, 6], [7, 7],
   [8, 4], [8, 5]], // F
  [[6, 1], [6, 2], [6, 3], [7, 1], [7, 2], [8, 1], [8, 2], [8, 3], [9, 1],
   [9, 2], [9, 3], [9, 4]], // G
  [[6, 7], [6, 8], [7, 8], [7, 9], [8, 8], [8, 9], [9, 8], [9, 9]], // H
  [[8, 6], [8, 7], [9, 5], [9, 6], [9, 7]], // I
].map(cells => cells.map(([r, c]) => at(r, c)));

// Exactly two stars per set: with a 0/1 domain, a plain Sum(2, ...) over a
// set already means "exactly two of these cells are 1".
const exactlyTwo = sets => sets.map(cells => new Sum(2, ...cells));

const rowCounts = exactlyTwo(graph.rows());
const colCounts = exactlyTwo(graph.columns());
const regionCounts = exactlyTwo(regions);

// No-touch: no king-adjacent pair of cells may both be 1. Four translated
// templates (right, down, down-right, down-left) cover every king-adjacency
// edge exactly once; Replicate shifts each template over every grid position
// where it stays on the board.
const noTouchKey = Pair.fnToKey((a, b) => !(a === 1 && b === 1), shape);
const inRange = (r, c) => r >= 1 && r <= 9 && c >= 1 && c <= 9;
const replicateNoTouch = (originR, originC, dR, dC, rRange, cRange) => {
  const origin = at(originR, originC);
  const targets = [];
  for (const r of rRange) {
    for (const c of cRange) {
      if (inRange(r + dR, c + dC)) targets.push(at(r, c));
    }
  }
  return new Replicate(
    [new Pair(noTouchKey, 'no touch', origin, at(originR + dR, originC + dC))],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin);
};
const rows1to9 = Array.from({ length: 9 }, (_, i) => i + 1);
const noTouch = [
  replicateNoTouch(1, 1, 0, 1, rows1to9, rows1to9), // horizontal
  replicateNoTouch(1, 1, 1, 0, rows1to9, rows1to9), // vertical
  replicateNoTouch(1, 1, 1, 1, rows1to9, rows1to9), // diagonal \
  replicateNoTouch(1, 2, 1, -1, rows1to9, rows1to9), // diagonal /
];

return [
  shape,
  ...rowCounts,
  ...colCounts,
  ...regionCounts,
  ...noTouch,
];
