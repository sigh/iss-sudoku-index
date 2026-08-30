// Title: Unknown
// Author: Kurt
// Video: https://www.youtube.com/watch?v=XObunchQvR4
// Source: https://tinyurl.com/y98qeu24

// Rules encoded, in full: "Place 2 stars in every row/column/region such
// that no two stars touch each other even diagonally."
//
// There are no sudoku digits at all -- the grid carries only star/no-star
// per cell -- so it is built on a Raw shape with a 2-value alphabet instead
// of a 1-9 digit grid (iss_solution is therefore the 100-cell star/no-star
// grid, not a digit grid).
//
// The 10 regions are not the default box tiling: they are irregular pieces
// bounded by drawn interior walls, recovered by flood-filling the grid
// against those walls (see the region layout diagram and per-region cell
// lists alongside this puzzle's rules).

const STAR = 1;
const NO_STAR = 2;

const shape = new Shape('10x10', 2, 'Raw');
const graph = cellGraph(shape);

// Region cell lists (row, col pairs), from the flood-filled layout. Row/col
// pairs, not hand-written ids: row/col 10 is not "10" in a cell id, so these
// go through makeCellId.
const regionCoords = [
  [[1, 1], [1, 2], [1, 3], [1, 4], [2, 2], [2, 3], [2, 4], [2, 5], [3, 4],
    [4, 2], [4, 3], [4, 4]],
  [[1, 5], [1, 6], [1, 7], [1, 8], [1, 9], [1, 10]],
  [[2, 1], [3, 1], [3, 2], [3, 3], [4, 1], [5, 1], [5, 2], [5, 3], [6, 1],
    [6, 2]],
  [[2, 6], [2, 7], [2, 8], [3, 7], [3, 8], [4, 7], [5, 6], [5, 7]],
  [[2, 9], [3, 9], [4, 8], [4, 9], [5, 8], [5, 9], [6, 5], [6, 6], [6, 7],
    [6, 8], [7, 6], [8, 6]],
  [[2, 10], [3, 10], [4, 10], [5, 10], [6, 9], [6, 10], [7, 9], [7, 10]],
  [[3, 5], [3, 6], [4, 5], [4, 6], [5, 4], [5, 5]],
  [[6, 3], [6, 4], [7, 1], [7, 2], [7, 3], [7, 4], [8, 1]],
  [[7, 5], [7, 7], [7, 8], [8, 5], [8, 7], [8, 8], [8, 9], [8, 10], [9, 5],
    [9, 6], [9, 7], [9, 8], [9, 9], [9, 10], [10, 7], [10, 8], [10, 9],
    [10, 10]],
  [[8, 2], [8, 3], [8, 4], [9, 1], [9, 2], [9, 3], [9, 4], [10, 1], [10, 2],
    [10, 3], [10, 4], [10, 5], [10, 6]],
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
// validated aceUogoL-QM.4 / A7CPYMUnafw star-battle no-touch pattern).
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
