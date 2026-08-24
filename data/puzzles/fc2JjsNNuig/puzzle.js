// Title: The Other Knight
// Author: PetLov
// Video: https://www.youtube.com/watch?v=fc2JjsNNuig
// Source: https://app.crackingthecryptic.com/sudoku/Pf6t9T8b6J

// Rules: normal 9x9 sudoku (rows, columns, boxes) plus "consecutive digits
// cannot appear a chess knight's move apart" -- for every pair of cells a
// knight's move apart, the two digits placed there must not differ by 1.
// This is the converse pairing of AntiKnight (same value forbidden) and
// AntiConsecutive (orthogonal adjacency forbidden): here the relation is
// "not consecutive" and the geometry is the knight graph, so neither built-in
// class applies and the rule is encoded directly as one Pair per knight edge.

const givens = [
  // Provenance: R#C# = value pairs transcribed from the puzzle's printed givens.
  ['R3C1', 3], ['R3C2', 4],
  ['R4C1', 8], ['R4C4', 2], ['R4C5', 6], ['R4C6', 1],
  ['R5C1', 1], ['R5C2', 6], ['R5C5', 9], ['R5C8', 7], ['R5C9', 3],
  ['R6C5', 7], ['R6C8', 1],
  ['R7C8', 6], ['R7C9', 4],
].map(([cell, value]) => new Given(cell, value));

// Knight-move edges, derived from grid geometry (not drawn data), grouped by
// Replicate into 4 templates: every knight offset has a nonzero row delta, so
// each unordered edge has exactly one representation with dr > 0, giving the
// 4 canonical (dr, dc) shapes below with no double-count and no omission.
const graph = cellGraph('9x9');
const notConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const KNIGHT_TEMPLATES = [[1, 2], [1, -2], [2, 1], [2, -1]];

const antiKnightConsecutive = KNIGHT_TEMPLATES.map(([dr, dc]) => {
  const minC = Math.max(1, 1 - dc), maxC = Math.min(9, 9 - dc);
  const origin = makeCellId(1, minC);
  const other = makeCellId(1 + dr, minC + dc);
  const targets = [];
  for (let r = 1; r <= 9 - dr; r++) {
    for (let c = minC; c <= maxC; c++) targets.push(makeCellId(r, c));
  }
  return new Replicate(
    [new Pair(notConsecutiveKey, 'not consecutive (knight)', origin, other)],
    Replicate.encodeTargetCells(targets, origin, graph),
    origin);
});

return [
  new Shape('9x9'),
  ...givens,
  ...antiKnightConsecutive,
];
