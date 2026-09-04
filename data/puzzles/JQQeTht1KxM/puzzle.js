// Title: Unknown
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=JQQeTht1KxM
// Source: https://cracking-the-cryptic.web.app/sudoku/678Ntf9M4p

// Rules, from the video's on-screen rules panel (the payload carries no
// metadata.rules): "Each row, column and irregular shape must contain two
// stars. Stars cannot touch each other, even diagonally."
//
// There are no sudoku digits at all -- the grid carries only star/no-star
// per cell -- so it is built on a Raw shape with a 2-value alphabet instead
// of a 1-9 digit grid (iss_solution is therefore the 100-cell star/no-star
// grid, not a digit grid).
//
// The 10 irregular regions are the source's own drawn jigsaw partition and
// are transcribed here verbatim; they already cover all 100 cells with no
// undocumented stub to recover.

const STAR = 1;
const NO_STAR = 2;

const shape = new Shape('10x10', 2, 'Raw');
const graph = cellGraph(shape);

// Region cell lists (row, col pairs, 0-indexed as in the source payload's
// region lists, +1 here). Row/col pairs, not hand-written ids, mirror the
// source's own [row, col] arrays one-for-one; transcribed verbatim from the
// source's 10 region entries.
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
const regions = drawnRegionCoords.map(coords => coords.map(([r, c]) => makeCellId(r, c)));

// Two stars per house: every row, column and region holds exactly two STAR
// cells (ContainExact names only the STAR count; with a 2-value domain the
// remaining cells of the house are automatically NO_STAR).
const twoPerHouse = [...graph.rows(), ...graph.columns(), ...regions]
  .map(house => new ContainExact(`${STAR}_${STAR}`, ...house));

// No two stars touch, including diagonally: for every king-move edge, not
// both cells are STAR. One Replicate per offset stamps the relation over
// every edge at that offset (same construction as the validated
// MNz03QgLBrY / sqG8MY1Glis / lMZ-Lb2hnvw / 1KGraaDXP_0 star-battle
// no-touch pattern).
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
