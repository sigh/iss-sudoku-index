// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=eeLmpQ3J_NA
// Source: https://cracking-the-cryptic.web.app/sudoku/Lj6T6nTt32

// Normal Sudoku rules apply.
//
// Hidden clone: the shape drawn by the ten grey cells occurs a second time
// somewhere in the grid, that copy holding the same digits in the same
// arrangement. Its position is not drawn; finding it is part of the solve.
//
// The source carries no rules text at all, so the clone rule above is taken
// from the video title ("Find that Shape! Hidden Clone Sudoku") together with
// the single grey region the source draws. Nothing available states which rigid
// motions the copy may use, whether it may overlap the grey shape, or how many
// copies there are, so the encoding takes the weakest reading of each: at least
// one copy, under any symmetry of the square, overlap permitted. The following
// are therefore not encoded: a restriction to translations only, a restriction
// that the copy be disjoint from the grey shape, and any "exactly one copy"
// count.

// Printed in the source grid.
const givens = [
  ['R1C1', 1], ['R1C3', 2], ['R2C2', 3], ['R2C6', 2], ['R2C9', 9],
  ['R3C1', 4], ['R3C5', 3], ['R3C8', 7], ['R3C9', 2], ['R5C3', 3],
  ['R5C9', 4], ['R6C2', 4], ['R6C8', 2], ['R6C9', 6], ['R8C3', 5],
  ['R8C6', 4], ['R8C8', 9], ['R8C9', 7], ['R9C2', 9], ['R9C3', 6],
  ['R9C5', 5], ['R9C6', 7], ['R9C8', 8],
];

// The ten cells the source fills grey, as [row, col].
const shape = [
  [1, 1], [1, 2], [1, 3],
  [2, 1], [2, 2], [2, 3], [2, 4],
  [3, 1], [3, 2],
  [4, 2],
];

// The eight symmetries of the square, as maps on a [row, col] offset: the four
// rotations, then each of them composed with a horizontal reflection.
const symmetries = [
  ([r, c]) => [r, c],
  ([r, c]) => [c, -r],
  ([r, c]) => [-r, -c],
  ([r, c]) => [-c, r],
  ([r, c]) => [r, -c],
  ([r, c]) => [c, r],
  ([r, c]) => [-r, c],
  ([r, c]) => [-c, -r],
];

// Every way the shape can be laid on the grid under one of those symmetries,
// each held as the ten [grey cell, image cell] pairs it puts in correspondence.
// Placements are keyed by that whole correspondence rather than by the set of
// image cells: the shape is symmetric about its main diagonal, so two
// symmetries can land on the same ten cells while pairing them differently,
// which are different clone readings of the same footprint.
const placements = new Map();
for (const symmetry of symmetries) {
  const image = shape.map(symmetry);
  const rows = image.map(([r]) => r);
  const cols = image.map(([, c]) => c);
  const minRow = Math.min(...rows);
  const minCol = Math.min(...cols);
  const height = Math.max(...rows) - minRow;
  const width = Math.max(...cols) - minCol;
  for (let topRow = 1; topRow + height <= 9; topRow++) {
    for (let leftCol = 1; leftCol + width <= 9; leftCol++) {
      const pairs = shape.map(([r, c], i) => [
        makeCellId(r, c),
        makeCellId(image[i][0] - minRow + topRow, image[i][1] - minCol + leftCol),
      ]);
      // Drop the placement that maps every grey cell to itself: it holds in
      // every grid, so keeping it would make the whole disjunction vacuous.
      if (pairs.every(([from, to]) => from === to)) continue;
      placements.set(pairs.map(pair => pair.join('')).join(''), pairs);
    }
  }
}

// One disjunct per placement; within a disjunct the copy is cell-wise, so each
// corresponding pair gets its own two-cell SameValues.
const hiddenClone = new Or([...placements.values()].map(
  pairs => new And(pairs.map(([from, to]) => new SameValues(2, from, to)))));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  hiddenClone,
];
