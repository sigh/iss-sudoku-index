// Title: S(even)
// Author: Nordy
// Video: https://www.youtube.com/watch?v=y-m_h0hmHJw
// Source: https://app.crackingthecryptic.com/sudoku/MhrLmh7MQG

// Rows, columns, and 9 irregular (jigsaw) regions hold 1-9. The grey square
// (R7C5) is an even digit. Every orthogonally adjacent pair of digits in the
// grid differs by at most 2 -- a global rule with no dedicated class, so it
// is stated as one Pair per grid edge below.
//
// The source payload's `regions` array carries a duplicate entry (its ninth
// listed region is byte-for-byte the same cell list as its second), leaving
// one region's true cells uncovered. The 9 uncovered cells (R5C2, R6C2,
// R7C2, R7C3, R7C4, R7C5, R8C5, R8C6, R8C7) form a single orthogonally
// connected chain -- the only shape consistent with a genuine jigsaw region
// -- so that chain is used as the ninth region below.

const graph = cellGraph('9x9');

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R2C7', 'R2C8'],
  ['R4C2', 'R4C3', 'R5C3', 'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C7', 'R6C8'],
  ['R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R6C1', 'R5C1', 'R4C1', 'R3C1'],
  ['R2C4', 'R2C5', 'R3C6', 'R2C3', 'R3C5', 'R3C7', 'R3C8', 'R4C8', 'R5C8'],
  ['R6C4', 'R6C5', 'R6C6', 'R6C3', 'R7C6', 'R7C7', 'R7C8', 'R8C8', 'R8C9'],
  ['R8C4', 'R9C4', 'R9C5', 'R9C6', 'R8C3', 'R8C2', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9'],
  ['R4C7', 'R4C6', 'R4C5', 'R4C4', 'R3C4', 'R3C3', 'R3C2', 'R2C2', 'R2C1'],
  ['R5C2', 'R6C2', 'R7C2', 'R7C3', 'R7C4', 'R7C5', 'R8C5', 'R8C6', 'R8C7'],
];

// "Adjacent digits differ by <= 2" applies to every orthogonal grid edge.
// The rule is one shifted template in each of the two edge directions
// (right-neighbour, down-neighbour), so each direction is one Replicate
// instead of 144 separate Pair constraints.
const diffKey = Pair.fnToKey((a, b) => Math.abs(a - b) <= 2, 9);

const rightStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const downStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));

const adjacentDiffs = [
  graph.makeReplicate(
    new Pair(diffKey, 'adjacent diff <= 2', 'R1C1', 'R1C2'), rightStarts),
  graph.makeReplicate(
    new Pair(diffKey, 'adjacent diff <= 2', 'R1C1', 'R2C1'), downStarts),
];

return [
  new Shape('9x9'),
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('9x9', ...cells)),

  new Given('R2C3', 7),
  new Given('R7C5', 2, 4, 6, 8),

  ...adjacentDiffs,
];
