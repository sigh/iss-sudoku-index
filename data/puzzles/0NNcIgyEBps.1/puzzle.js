// Title: Star Battle
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=0NNcIgyEBps
// Source: https://cracking-the-cryptic.web.app/sudoku/678Ntf9M4p

// Rules (from the on-screen rules panel of the "Star Battle: US Puzzle
// Championship 2019" video, which plays this same source page; the page
// itself carries no rules text):
//   "Each row, column and irregular shape must contain two stars. Stars
//   cannot touch each other, even diagonally."
//
// There is no digit layer: each cell is star / no star, so the board is a
// Raw 10x10 grid with a 2-value alphabet (1 = star, 2 = no star) and every
// rule is stated explicitly. Nothing is omitted.

const STAR = 1;
const NO_STAR = 2;

const shape = new Shape('10x10', 2, 'Raw');
const graph = cellGraph(shape);

// The ten irregular regions, transcribed one-for-one from the source's own
// region lists (source is [row, col] 0-indexed; +1 here for R#C# numbering).
const drawnRegionCoords = [
  [[1, 1], [1, 2], [1, 3], [1, 4], [2, 1], [2, 2], [2, 3], [3, 2], [3, 1],
    [4, 1], [4, 2], [5, 1], [6, 1], [7, 1], [8, 1]],
  [[1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [2, 6], [2, 7], [2, 9], [2, 10],
    [2, 4], [2, 5], [1, 5]],
  [[3, 3], [4, 3], [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [2, 8], [4, 8]],
  [[3, 9], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10]],
  [[4, 4], [4, 5], [4, 6], [4, 7], [5, 7], [5, 8], [5, 9], [4, 9], [6, 9],
    [7, 9], [7, 8], [8, 8]],
  [[5, 2], [5, 3], [5, 4], [6, 3], [7, 3], [8, 3], [9, 3], [10, 3]],
  [[6, 2], [7, 2], [8, 2], [9, 2], [9, 1], [10, 1], [10, 2]],
  [[8, 9], [9, 8], [9, 9], [10, 9], [10, 10], [9, 10]],
  [[9, 4], [10, 4], [10, 5], [10, 6], [9, 6], [8, 6], [8, 7], [9, 7],
    [10, 7], [10, 8]],
  [[6, 4], [7, 4], [8, 4], [8, 5], [9, 5], [7, 5], [6, 5], [5, 5], [5, 6],
    [6, 6], [7, 6], [7, 7], [6, 7], [6, 8]],
];
const regions = drawnRegionCoords.map(
  coords => coords.map(([row, col]) => makeCellId(row, col)));

// Exactly two STAR cells in every row, column and region. The 2-value
// alphabet makes every other cell of the house NO_STAR.
const twoStarsPerHouse = [...graph.rows(), ...graph.columns(), ...regions]
  .map(house => new ContainExact(`${STAR}_${STAR}`, ...house));

// No two stars touch, even diagonally: for every king-move neighbour pair,
// not both cells are STAR. The four offsets below cover every such pair once
// (east, south, south-east, south-west); one Replicate per offset stamps the
// Pair over every cell that has a neighbour at that offset.
const notBothStars = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), shape);
const KING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const starsDoNotTouch = KING_OFFSETS.map(([dRow, dCol]) => {
  const targets = graph.cells().filter(cell => graph.step(cell, dRow, dCol) !== null);
  const origin = targets[0];
  const neighbour = graph.step(origin, dRow, dCol);
  return new Replicate(
    [new Pair(notBothStars, 'stars do not touch', origin, neighbour)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin,
  );
});

return [
  shape,
  ...twoStarsPerHouse,
  ...starsDoNotTouch,
];
