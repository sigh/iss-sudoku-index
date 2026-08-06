// Title: 89
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=eAZ4qpW9yjs
// Source: https://sudokupad.app/jl4bufy55q

// Normal sudoku rules apply. Two variant rules:
//   - Anti-knight: no repeat on a knight's move -> AntiKnight().
//   - Diagonal cell pairs (sharing a corner) differ by at least 2. There is
//     no native class for this, so it is a Pair over each diagonal edge
//     checked against |a-b|>=2, replicated from one template edge over each
//     of the two diagonal directions rather than instantiated 128 times by
//     hand.

const graph = cellGraph();
const allCells = graph.cells();

const diffAtLeast2 = Pair.fnToKey((a, b) => Math.abs(a - b) >= 2, 9);

// Down-right diagonal edges (row+1,col+1 offset): template anchored at
// R1C1 (graph.makeReplicate()'s fixed origin), replicated over every anchor
// whose down-right neighbour is in-grid.
const downRightAnchors = allCells.filter(cell => graph.step(cell, 1, 1) !== null);
const downRightEdges = graph.makeReplicate(
  new Pair(diffAtLeast2, '', 'R1C1', graph.step('R1C1', 1, 1)),
  downRightAnchors,
);

// Down-left diagonal edges (row+1,col-1 offset): graph.makeReplicate() always
// anchors at R1C1, which has no in-grid down-left neighbour to build the
// template from, so this constructs Replicate directly with origin R1C2 --
// the topmost-leftmost cell with an in-grid down-left neighbour -- instead.
const downLeftOrigin = 'R1C2';
const downLeftAnchors = allCells.filter(cell => graph.step(cell, 1, -1) !== null);
const downLeftEdges = new Replicate(
  [new Pair(diffAtLeast2, '', downLeftOrigin, graph.step(downLeftOrigin, 1, -1))],
  Replicate.encodeTargetCells(downLeftAnchors, downLeftOrigin, graph),
  downLeftOrigin,
);

return [
  new Shape('9x9'),
  new Given('R4C5', 9),
  new Given('R6C3', 8),
  new AntiKnight(),
  downRightEdges,
  downLeftEdges,
];
