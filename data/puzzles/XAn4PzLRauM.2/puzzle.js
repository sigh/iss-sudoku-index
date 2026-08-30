// Title: Vama
// Author: shye
// Video: https://www.youtube.com/watch?v=XAn4PzLRauM
// Source: https://tinyurl.com/dawcxs85
//
// Shade some cells so every row, column, and outlined region has exactly 2
// shaded cells. Cell value 1 means shaded, 0 means unshaded; there are no
// digits, so the grid uses the Raw type with an explicit rule for every row,
// column and region -- Raw carries no implicit row/column all-different, and
// there are no default boxes to lean on either.
//
// The puzzle also requires every shaded cell to be reachable from every other
// through a chain of shaded cells that may touch orthogonally OR diagonally
// (a "king move" network). That clause is not encoded: ISS's only global
// connectivity primitive hardcodes orthogonal-only adjacency, so applying it
// here would reject valid answers whose shaded region is connected only
// through a diagonal touch -- a tightening, not a faithful encoding.
//
// Region layout (10 outlined regions, transcribed from the drawn region
// borders):
//   A A A A A A A B B B
//   C C C C C C C B C B
//   D D D D D D C C C D
//   E E E E E D D D D D
//   E E E E E E E E F F
//   G G G G G E E E F F
//   H I I J G E E E E F
//   H I I J G E E E E F
//   H J J J G E E E E F
//   H H H E E E E E E F

const regionCoords = {
  A: [[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],[1,7]],
  B: [[1,8],[1,9],[1,10],[2,8],[2,10]],
  C: [[2,1],[2,2],[2,3],[2,4],[2,5],[2,6],[2,7],[2,9],[3,7],[3,8],[3,9]],
  D: [[3,1],[3,2],[3,3],[3,4],[3,5],[3,6],[3,10],[4,6],[4,7],[4,8],[4,9],[4,10]],
  E: [
    [4,1],[4,2],[4,3],[4,4],[4,5],
    [5,1],[5,2],[5,3],[5,4],[5,5],[5,6],[5,7],[5,8],
    [6,6],[6,7],[6,8],
    [7,6],[7,7],[7,8],[7,9],
    [8,6],[8,7],[8,8],[8,9],
    [9,6],[9,7],[9,8],[9,9],
    [10,4],[10,5],[10,6],[10,7],[10,8],[10,9],
  ],
  F: [[5,9],[5,10],[6,9],[6,10],[7,10],[8,10],[9,10],[10,10]],
  G: [[6,1],[6,2],[6,3],[6,4],[6,5],[7,5],[8,5],[9,5]],
  H: [[7,1],[8,1],[9,1],[10,1],[10,2],[10,3]],
  I: [[7,2],[7,3],[8,2],[8,3]],
  J: [[7,4],[8,4],[9,2],[9,3],[9,4]],
};

const shape = new Shape('10x10', '0-1', 'Raw');
const graph = cellGraph(shape);
const cellAt = ([row, col]) => makeCellId(row, col);

const rowSums = graph.rows().map(row => new Sum(2, ...row));
const colSums = graph.columns().map(col => new Sum(2, ...col));
const regionSums = Object.values(regionCoords)
  .map(coords => new Sum(2, ...coords.map(cellAt)));

return [
  shape,
  ...rowSums,
  ...colSums,
  ...regionSums,
];
