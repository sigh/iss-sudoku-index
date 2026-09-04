// Title: Unknown
// Author: Ko Okamoto
// Video: https://www.youtube.com/watch?v=HKohViAyRyg
// Source: https://cracking-the-cryptic.web.app/sudoku/Jbf4dnT83n

// Rules, from the video's on-screen rules panel (the payload carries no
// metadata.rules): "Every row, column and region must contain two stars.
// Stars cannot touch each other, even diagonally."
//
// There are no sudoku digits at all -- the grid carries only star/no-star
// per cell -- so it is built on a Raw shape with a 2-value alphabet instead
// of a 1-9 digit grid (iss_solution is therefore the 169-cell star/no-star
// grid, not a digit grid).
//
// The source's regions array lists 14 entries for the jigsaw partition, but
// only 11 are well-formed with real coordinates; a 12th duplicates one of
// those 11 verbatim (a serialization glitch, not a 12th region); and the
// last 2 are bare placeholders (`[{}]`, no coordinates at all). Together the
// 11 well-formed entries cover 143 of 169 cells, leaving 26 cells -- split
// into one 17-cell block and one 9-cell block -- with no region of their
// own in the payload.
//
// Those last two regions are recovered here from the video's rules-panel
// frame (external-video-frame-1654s.jpg) rather than guessed: the on-screen
// grid renders every region boundary as a bold (~5-6px) ruling and every
// same-region cell border as a thin (~1-2px) one, at a uniform ~77.6px
// cell pitch. Measuring every interior cell edge's line thickness and
// thresholding thick-vs-thin, then flood-filling within thin-bordered
// edges, reconstructs a 13-region partition of the full board. 11 of those
// 13 recovered regions match the source's 11 well-formed entries exactly,
// cell-for-cell -- not just in size -- which is the cross-check that the
// pixel measurement is right. The other 2 recovered regions are exactly the
// 17-cell and 9-cell blocks the payload left uncovered, and fit the jigsaw
// partition with no leftover or overlapping cells.

const STAR = 1;
const NO_STAR = 2;

const shape = new Shape('13x13', 2, 'Raw');
const graph = cellGraph(shape);

// Region cell lists (row, col pairs, 1-indexed for makeCellId -- the source
// payload's own region lists are 0-indexed, so every coordinate here is the
// payload's value plus 1). The first 11 lists are transcribed verbatim from
// the source's 11 well-formed region entries (its 12th entry, a
// byte-for-byte duplicate of the first, and its 2 coordinate-less
// placeholder entries are dropped, not encoded). The last 2 lists are the
// regions recovered from the video frame as described above, standing in
// for the 2 dropped placeholders.
const drawnRegionCoords = [
  [[5, 1], [4, 1], [3, 1], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [1, 5]],
  [[1, 6], [1, 7], [1, 8], [2, 7], [3, 7], [3, 6], [3, 5], [3, 4], [3, 3], [3, 8], [3, 9], [3, 10], [3, 11], [4, 11]],
  [[1, 9], [1, 10], [1, 11], [1, 12], [1, 13], [2, 13], [3, 13], [4, 13], [5, 13]],
  [[2, 8], [2, 9], [2, 10], [2, 11], [2, 12], [3, 12], [4, 12], [5, 12], [6, 12]],
  [[2, 6], [2, 5], [2, 4], [2, 3], [2, 2], [3, 2], [4, 2], [5, 2], [6, 2]],
  [[6, 1], [7, 1], [8, 1], [9, 1], [7, 2], [7, 3], [5, 3], [6, 3], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [4, 10], [4, 9], [5, 10], [5, 11], [6, 11], [7, 11], [7, 12], [7, 13], [6, 13], [8, 13]],
  [[10, 1], [11, 1], [12, 1], [13, 1], [13, 2], [13, 3], [13, 4], [13, 5]],
  [[10, 13], [11, 13], [9, 13], [12, 13], [13, 13], [13, 12], [13, 11], [13, 10], [13, 9]],
  [[13, 7], [13, 6], [13, 8], [12, 7], [11, 7], [11, 8], [10, 8], [11, 9], [11, 10], [11, 11], [10, 11], [9, 11], [8, 11], [11, 6], [11, 5], [11, 4], [11, 3], [10, 3], [9, 3], [8, 3], [8, 4], [7, 4], [7, 5], [10, 6], [9, 6]],
  [[8, 2], [9, 2], [10, 2], [11, 2], [12, 2], [12, 3], [12, 4], [12, 5], [12, 6]],
  [[5, 4], [6, 4], [5, 5], [6, 5], [5, 6], [6, 6], [7, 6], [8, 6], [7, 7], [5, 7], [5, 8], [5, 9], [6, 9], [8, 5], [9, 5], [9, 4], [10, 4], [10, 5]],
  // Recovered (17 cells): fills the payload's first coordinate-less region.
  [[6, 7], [6, 8], [6, 10], [7, 8], [7, 9], [7, 10], [8, 7], [8, 8], [8, 9], [8, 10], [9, 7], [9, 8], [9, 9], [9, 10], [10, 7], [10, 9], [10, 10]],
  // Recovered (9 cells): fills the payload's second coordinate-less region.
  [[8, 12], [9, 12], [10, 12], [11, 12], [12, 8], [12, 9], [12, 10], [12, 11], [12, 12]],
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
