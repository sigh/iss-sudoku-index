// Title: Easy as 1, 2, 3 ...
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=9e-StkX3aZI
// Source: https://sudokupad.app/d4aamhonge

// Normal sudoku rules apply (rows, columns, boxes all-different).
// Standard killer cages: digits in a cage don't repeat and sum to the total.
// Every orthogonally adjacent pair of cells is bound by rule 3: sum to 10 if
// the edge carries a drawn X, otherwise sum to anything but 3, 10, 12, or 17.
// This is an exhaustively-marked family (one X drawn; every other edge is the
// "no X" case), so the unmarked edges get the negated predicate directly --
// ISS has no strict class for this custom pair. Replicate carries the
// negated-predicate template over the two offset groups (rightward and
// downward edges); the one drawn X edge is excluded from its group and
// encoded with the native X class instead.

const graph = cellGraph('9x9');
const xEdge = ['R3C6', 'R3C7']; // source overlay: text "X" on this edge

const rightTargets = graph.cells().filter(cell => {
  const right = graph.step(cell, 0, 1);
  return right && !(cell === xEdge[0] && right === xEdge[1]);
});
const downTargets = graph.cells().filter(cell => graph.step(cell, 1, 0));

const notXV = Pair.fnToKey(
  (a, b) => a + b !== 3 && a + b !== 10 && a + b !== 12 && a + b !== 17, 9);

const rightReplicate = graph.makeReplicate(
  new Pair(notXV, 'NotXV', 'R1C1', 'R1C2'), rightTargets);
const downReplicate = graph.makeReplicate(
  new Pair(notXV, 'NotXV', 'R1C1', 'R2C1'), downTargets);

// Cages (all marked all-different), from the puzzle's drawn cage geometry.
const cages = [
  new Cage(6, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(6, 'R2C4', 'R2C5', 'R3C4'),
  new Cage(6, 'R8C2', 'R8C3', 'R9C3'),
  new Cage(6, 'R3C7', 'R3C8', 'R4C8'),
  new Cage(10, 'R4C1', 'R5C1', 'R5C2', 'R6C1'),
  new Cage(10, 'R5C4', 'R5C5', 'R6C5', 'R6C6'),
];

return [
  new Shape('9x9'),
  ...cages,
  new X(...xEdge),
  rightReplicate,
  downReplicate,
];
