// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=euESXLhDsbk
// Source: https://www.janestreet.com/numberphile-2023/

// Rules encoded, in full (video description): "Place stars in the grid such
// that each region, row, and column contains exactly 2 stars. Stars cannot
// neighbour other stars, even diagonally." ("Then read the letters overlaid
// with stars" is a post-solve reveal over a fixed letter printed in each
// cell -- it names no further constraint on which cells hold a star, so it
// is not encoded.)
//
// There are no sudoku digits at all -- the grid carries only star/no-star
// per cell -- so it is built on a Raw shape with a 2-value alphabet instead
// of a 1-9 digit grid (iss_solution is therefore the 121-cell star/no-star
// grid, not a digit grid).
//
// The eleven regions are not the default box tiling: they are irregular
// pieces read off the puzzle's own drawn region-boundary art (the source
// page renders its grid from a raster image rather than shipping structured
// region data).

const STAR = 1;
const NO_STAR = 2;

const shape = new Shape('11x11', 2, 'Raw');
const graph = cellGraph(shape);

// Region cell lists (row, col pairs), transcribed from the drawn region
// boundaries in the puzzle's own grid artwork.
const regionCoords = [
  [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1], [3, 2], [4, 2]],
  [[1, 3], [2, 3], [3, 3], [4, 1], [4, 3], [5, 1], [5, 2], [5, 3]],
  [[1, 4], [1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10], [1, 11],
    [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [2, 9], [2, 10], [2, 11],
    [3, 4], [3, 5], [3, 6], [3, 7], [3, 8], [3, 9], [3, 10], [3, 11], [4, 4]],
  [[4, 5], [4, 6], [4, 7], [5, 5], [6, 5], [6, 6], [6, 7], [7, 7],
    [8, 5], [8, 6], [8, 7]],
  [[4, 8], [4, 9], [4, 10], [4, 11], [5, 6], [5, 7], [5, 8], [5, 9],
    [5, 10], [5, 11]],
  [[5, 4], [6, 4], [7, 4], [7, 5], [7, 6]],
  [[6, 1], [6, 2], [6, 3], [7, 1], [7, 2], [7, 3], [8, 1], [8, 2], [8, 3],
    [8, 4], [9, 1], [9, 2], [9, 3], [9, 4], [10, 1], [10, 2], [10, 3],
    [10, 4], [10, 6], [10, 7], [11, 1], [11, 2], [11, 3], [11, 4], [11, 5],
    [11, 6], [11, 7]],
  [[6, 8], [6, 9], [6, 10], [6, 11], [7, 8], [8, 8], [9, 8], [10, 8], [11, 8]],
  [[7, 9], [7, 10], [7, 11], [8, 9], [9, 9], [10, 9], [11, 9], [11, 10],
    [11, 11]],
  [[8, 10], [8, 11], [9, 10], [9, 11], [10, 10], [10, 11]],
  [[9, 5], [9, 6], [9, 7], [10, 5]],
];
const regions = regionCoords.map(coords => coords.map(([r, c]) => makeCellId(r, c)));

// Two stars per house: every row, column and region holds exactly two STAR
// cells (ContainExact names only the STAR count; with a 2-value domain the
// remaining cells of the house are automatically NO_STAR).
const twoPerHouse = [...graph.rows(), ...graph.columns(), ...regions]
  .map(house => new ContainExact(`${STAR}_${STAR}`, ...house));

// No two stars touch, including diagonally: for every king-move edge, not
// both cells are STAR. One Replicate per offset stamps the relation over
// every edge at that offset; the anti-diagonal offset needs the explicit
// target-cell encoding below rather than graph.makeReplicate, whose origin
// anchor would shift a template cell off the board (same construction as the
// validated -H7B7dUTJvw / XObunchQvR4.1 / aceUogoL-QM.4 / A7CPYMUnafw /
// 1KGraaDXP_0 / sqG8MY1Glis / xQbv83aUHLU star-battle no-touch pattern).
const notBothStars = Pair.fnToKey((a, b) => !(a === STAR && b === STAR), shape);
const KING_OFFSETS = [[0, 1], [1, 0], [1, 1], [1, -1]];
const noTouch = KING_OFFSETS.map(([dRow, dCol]) => {
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
  ...twoPerHouse,
  ...noTouch,
];
