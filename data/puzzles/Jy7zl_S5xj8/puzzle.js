// Title: Shredded
// Author: LibardiA
// Video: https://www.youtube.com/watch?v=Jy7zl_S5xj8
// Source: https://app.crackingthecryptic.com/817bobvnn5

// Normal Sudoku applies to the reassembled 9x9 grid.  The VP variables are
// the 81 cells on the separated canvas.  A piece's centre digit names its
// reading-order box, so conditional equalities place that physical piece into
// the corresponding box of the ordinary grid.  Killer cages and givens refer
// to the physical canvas.  Blue-line equal segment sums are omitted: the
// payload supplies seven disconnected fragments but not their post-assembly
// line groupings.

const grid = cellGraph('9x9');
const physicalGraph = grid.makeOverlay('VP');
const physical = physicalGraph.toVar('separated 3x3-piece cells');
const pieces = [
  // The nine black-outlined 3x3 pieces, transcribed as canvas top-left cells.
  [1, 3], [2, 7], [3, 11], [5, 2], [6, 6], [7, 10], [9, 1], [10, 5], [11, 9],
];
const physicalAt = new Map();
pieces.forEach(([top, left], piece) =>
  physicalGraph.box(piece + 1).forEach((cell, index) =>
    physicalAt.set(`${top + Math.floor(index / 3)},${left + index % 3}`, cell)));
const p = (row, col) => physicalAt.get(`${row},${col}`);
const virtual = (box, dr, dc) => grid.box(box)[dr * 3 + dc];
const centres = pieces.map(([top, left]) => p(top + 1, left + 1));

// One physical piece bears each of the nine reading-order box numbers.  When
// its centre is box N, each of its nine local positions equals the matching
// local position in virtual box N.  The first Or branch is centre != N.
const placement = pieces.flatMap(([top, left], piece) => {
  const centre = centres[piece];
  return Array.from({ length: 9 }, (_, index) => {
    const dr = Math.floor(index / 3);
    const dc = index % 3;
    return new Or([
      new Given(centre, ...Array.from({ length: 9 }, (_, i) => i + 1).filter(v => v !== piece + 1)),
      new SameValues(2, p(top + dr, left + dc), virtual(piece + 1, dr, dc)),
    ]);
  });
});

// Canvas givens and killer cages transcribed from the source payload.
const givens = [
  [3, 11, 4], [4, 13, 6], [7, 3, 4],
].map(([row, col, value]) => new Given(p(row, col), value));
const cages = [
  [28, [[2, 8], [2, 9], [3, 8], [3, 9]]],
  [10, [[12, 10], [13, 9], [13, 10]]],
  [5, [[8, 6], [8, 7]]], [12, [[3, 4], [3, 5]]],
  [10, [[6, 4], [7, 4]]], [10, [[7, 11], [7, 12]]],
  [8, [[5, 2], [5, 3]]], [9, [[4, 7], [4, 8]]],
].map(([sum, cells]) => new Cage(sum, ...cells.map(([row, col]) => p(row, col))));

return [
  new Shape('9x9'),
  physical,
  new AllDifferent(...centres),
  ...placement,
  ...givens,
  ...cages,
];
