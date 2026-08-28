// Title: Nobody puts NINE in the corner!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=GrLVkH122XU
// Source: https://cracking-the-cryptic.web.app/sudoku/H9f8JQdM8J

// Normal sudoku rules apply (rows, columns and the nine 3x3 boxes each
// contain 1-9 once). Two cells a knight's move apart may not hold the same
// digit, except 9: every 9 in the grid must have at least one knight's-move
// neighbour that is also a 9. (Rules text is from the video description;
// the payload itself carries no in-app rules and no clue geometry beyond
// the givens and standard box regions.)

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// Givens, transcribed from the puzzle's drawn digits.
const givens = [
  new Given('R1C4', 4), new Given('R1C6', 6),
  new Given('R2C2', 7), new Given('R2C5', 2), new Given('R2C8', 3),
  new Given('R3C3', 6), new Given('R3C7', 1),
  new Given('R4C1', 5), new Given('R4C9', 2),
  new Given('R5C2', 8), new Given('R5C5', 9), new Given('R5C8', 4),
  new Given('R6C1', 7), new Given('R6C9', 3),
  new Given('R7C3', 2), new Given('R7C7', 7),
  new Given('R8C2', 1), new Given('R8C5', 5), new Given('R8C8', 6),
  new Given('R9C4', 7), new Given('R9C6', 2),
];

// The 8 knight-move offsets, used to build both rules below.
const KNIGHT_OFFSETS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];

// Anti-knight, with an exception for 9: a pair a knight's move apart is
// allowed to match only when the shared value is 9.
const antiKnightExceptNineKey = Pair.fnToKey(
  (a, b) => !(a === b && a !== 9), shape);

// Each undirected knight edge is covered by exactly one of these 4 offsets
// (the other 4 offsets are each one of these negated, i.e. the same edge
// read from its other end): (1,2) & (-1,-2) are one edge shape, (1,-2) &
// (-1,2) another, (2,1) & (-2,-1) another, (2,-1) & (-2,1) the last.
// Replicate stamps one Pair template per shape onto every cell where the
// shifted cell stays on the grid, instead of writing one Pair per edge.
const antiKnightExceptNine = [[1, 2], [1, -2], [2, 1], [2, -1]]
  .map(([dr, dc]) => {
    // The template's anchor cell is the first one (in row-major order) this
    // offset stays on the grid from, so every valid target sorts no earlier
    // than it -- Replicate requires that. For (1,2) and (2,1) that anchor is
    // R1C1 itself (graph.cells()[0]); for (1,-2) and (2,-1) it is not, since
    // R1C1 has no column to its left, so those two go through the bare
    // Replicate constructor with an explicit origin instead of
    // graph.makeReplicate() (which always anchors at R1C1).
    const origin = graph.cells().find(c => graph.step(c, dr, dc) !== null);
    const other = graph.step(origin, dr, dc);
    const pair = new Pair(antiKnightExceptNineKey, 'anti-knight except 9', origin, other);
    const targets = graph.cells().filter(c => graph.step(c, dr, dc) !== null);
    if (origin === graph.cells()[0]) {
      return graph.makeReplicate([pair], targets);
    }
    const targetBitset = Replicate.encodeTargetCells(targets, origin, graph);
    // lint-ok: bare-replicate-constructor
    return new Replicate([pair], targetBitset, origin);
  });

// "Every 9 must be a knight's move from at least one other 9" is an
// existential over each cell's knight neighbours, not a pairwise relation,
// so it is built as one Or per cell: either that cell isn't 9 (candidate
// restriction to 1-8), or one of its knight-move neighbours is a 9.
const nineNeedsKnightNine = graph.cells().map(cell => {
  const neighbours = KNIGHT_OFFSETS
    .map(([dr, dc]) => graph.step(cell, dr, dc))
    .filter(c => c !== null);
  return new Or([
    new Given(cell, 1, 2, 3, 4, 5, 6, 7, 8),
    ...neighbours.map(n => new Given(n, 9)),
  ]);
});

return [
  shape,
  ...givens,
  ...antiKnightExceptNine,
  ...nineNeedsKnightNine,
];
