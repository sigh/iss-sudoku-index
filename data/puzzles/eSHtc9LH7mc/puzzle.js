// Title: Imparity Sudoku
// Author: Brandon Dong
// Video: https://www.youtube.com/watch?v=eSHtc9LH7mc
// Source: https://app.crackingthecryptic.com/sudoku/B4fGtLFjq6

// Normal sudoku rules (default row/column/box all-different from Shape).
// Extra rule: no two orthogonally adjacent cells may both hold even digits
// (equivalently, every neighbour of an even digit is odd). Encoded as one
// `Pair` predicate tiled with `Replicate` over every horizontal edge and
// every vertical edge in the grid, derived from `cellGraph` rather than
// hand-listing the ~140 edges.

const graph = cellGraph('9x9');
const notBothEven = Pair.fnToKey((a, b) => !(a % 2 === 0 && b % 2 === 0), 9);

// Cells that have a right neighbour / a down neighbour -- i.e. every column
// but the last, and every row but the last, respectively.
const rightStarts = graph.cells().filter(c => graph.step(c, 0, 1) !== null);
const downStarts = graph.cells().filter(c => graph.step(c, 1, 0) !== null);

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C7', 6),
  new Given('R1C8', 9),
  new Given('R1C9', 8),
  new Given('R2C5', 9),
  new Given('R2C7', 1),
  new Given('R4C6', 6),
  new Given('R4C8', 8),
  new Given('R4C9', 9),
  new Given('R5C3', 4),
  new Given('R5C8', 5),
  new Given('R6C5', 7),
  new Given('R7C4', 7),
  new Given('R8C1', 7),
  new Given('R8C7', 9),
  new Given('R9C4', 3),

  // No two orthogonally adjacent cells are both even.
  graph.makeReplicate(
    new Pair(notBothEven, 'no adjacent evens (horizontal)', 'R1C1', 'R1C2'),
    rightStarts,
  ),
  graph.makeReplicate(
    new Pair(notBothEven, 'no adjacent evens (vertical)', 'R1C1', 'R2C1'),
    downStarts,
  ),
];
