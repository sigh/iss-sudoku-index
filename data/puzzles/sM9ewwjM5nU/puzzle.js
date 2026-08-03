// Title: Decimation
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=sM9ewwjM5nU
// Source: https://app.crackingthecryptic.com/sudoku/fmRMNJ6TmT

// Normal sudoku rules (default Shape gives rows/columns/boxes all-different).
// Cages: digits sum to the corner total and cannot repeat within the cage.
// X marks: the two digits either side of a drawn X sum to 10.
// "All possible Xs are given": every orthogonally adjacent cell pair that has
// no drawn X must NOT sum to 10 -- built below as a Replicate'd negated-sum
// Pair over every grid adjacency, minus the drawn X edges. One Replicate per
// orientation, since a template's offset (here: one column right, or one row
// down) is fixed across all its targets.

const graph = cellGraph('9x9');

// Drawn X marks, named by the cell the mark's other cell is reached from
// (right neighbour for horizontal marks, down neighbour for vertical marks).
const xHorizontalLeft = ['R7C5', 'R6C4', 'R4C7', 'R3C6', 'R2C7'];
const xVerticalTop = ['R6C3', 'R7C4', 'R4C6', 'R5C7', 'R7C2'];

const xMarks = [
  ...xHorizontalLeft.map(c => [c, graph.step(c, 0, 1)]),
  ...xVerticalTop.map(c => [c, graph.step(c, 1, 0)]),
];

const notTen = Pair.fnToKey((a, b) => a + b !== 10, 9);

// Left/top cell of every horizontal/vertical adjacent pair in the grid.
const rightNeighborOf = graph.cells().filter(c => graph.step(c, 0, 1));
const downNeighborOf = graph.cells().filter(c => graph.step(c, 1, 0));

return [
  new Shape('9x9'),

  // Cages.
  new Cage(20, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(13, 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Cage(35, 'R4C7', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C4', 'R7C5'),
  new Cage(26, 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Cage(20, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),

  // Drawn X marks.
  ...xMarks.map(([a, b]) => new X(a, b)),

  // Every other horizontally-adjacent pair must not sum to 10: the
  // R1C1-R1C2 template stamped onto every left-cell target except the drawn
  // horizontal X marks.
  graph.makeReplicate(
    new Pair(notTen, '', 'R1C1', 'R1C2'),
    rightNeighborOf.filter(c => !xHorizontalLeft.includes(c)),
  ),
  // Every other vertically-adjacent pair must not sum to 10: the R1C1-R2C1
  // template stamped onto every top-cell target except the drawn vertical X
  // marks.
  graph.makeReplicate(
    new Pair(notTen, '', 'R1C1', 'R2C1'),
    downNeighborOf.filter(c => !xVerticalTop.includes(c)),
  ),
];
