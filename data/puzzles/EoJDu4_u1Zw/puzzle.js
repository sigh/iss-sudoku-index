// Title: No-divisor Sudoku
// Author: Nils Leder
// Video: https://www.youtube.com/watch?v=EoJDu4_u1Zw
// Source: https://app.crackingthecryptic.com/sudoku/HnH4qH6gH2

// Normal sudoku rules apply (standard rows/columns/boxes, the ISS default).
// No digit may be orthogonally adjacent to one of its divisors, other than 1
// (e.g. 6 cannot touch a 2 or a 3). There is no built-in class for this
// relation, so it is a custom pairwise predicate applied to every grid edge,
// all sharing one key.

const graph = cellGraph('9x9');
const cells = graph.cells();

// A pair (a, b) is allowed unless one value is a proper divisor (>1, != the
// other value) of the other -- symmetric, so either order is caught.
const notDivisorPair = Pair.fnToKey(
  (a, b) => !(a > 1 && b > 1 && a !== b && (a % b === 0 || b % a === 0)), 9);

// Every orthogonal grid edge, each counted once, as two Replicate-shifted
// copies of one template Pair: rightward (R1C1-R1C2) over every cell with a
// right neighbour, downward (R1C1-R2C1) over every cell with a down
// neighbour. Shorter than one Pair per edge and equivalent to it.
const rightOrigins = cells.filter(c => graph.step(c, 0, 1) !== null);
const downOrigins = cells.filter(c => graph.step(c, 1, 0) !== null);
const noDivisorEdges = [
  graph.makeReplicate(
    new Pair(notDivisorPair, 'no-divisor-adjacency', 'R1C1', 'R1C2'),
    rightOrigins),
  graph.makeReplicate(
    new Pair(notDivisorPair, 'no-divisor-adjacency', 'R1C1', 'R2C1'),
    downOrigins),
];

// Givens, provenance: the payload's `cells` grid.
const givens = [
  ['R1C2', 8], ['R2C4', 6], ['R2C8', 5], ['R3C3', 4], ['R3C7', 1],
  ['R4C2', 6], ['R5C4', 1], ['R5C6', 8], ['R5C8', 7], ['R6C1', 9],
  ['R7C2', 2], ['R7C8', 4], ['R8C4', 7], ['R9C5', 3],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...noDivisorEdges,
];
