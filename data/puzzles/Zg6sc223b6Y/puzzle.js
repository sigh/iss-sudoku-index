// Title: Myriad of Triad
// Author: Wesley Murphy
// Video: https://www.youtube.com/watch?v=Zg6sc223b6Y
// Source: https://app.crackingthecryptic.com/sudoku/LTdPqqtpFq

// Normal sudoku rules apply (default 9x9 shape: rows, columns, and the
// payload's 3x3 boxes are all-different).
//
// Outside-grid circles show the sum of the indicated diagonal, and the
// rules text says that diagonal's digits may repeat -- so each is a plain
// Sum, not a Cage/Diagonal all-different line.
//
// "All instances of neighbouring digits having a difference of 3 are shown"
// with a circled 3 on the shared edge. This is exhaustive: every orthogonal
// edge NOT carrying a circled 3 must NOT have a difference of 3. There is
// no native difference-of-N class, so both directions use a custom `Pair`
// predicate keyed on the absolute difference.

const graph = cellGraph('9x9');

// Diagonal sum clues. Each outside-clue arrow is a straight 45-degree ray
// from its circle; continuing that ray past its second drawn waypoint lands
// exactly on a cell centre, which fixes both the direction (down-left) and
// the diagonal's start cell for all five arrows -- confirmed by ray
// arithmetic, not by the geometry helper's tie-break note (which only
// concerns the ray's start point, not its direction).
const diagonalSums = [
  [9, ['R1C3', 'R2C2', 'R3C1']],
  [26, ['R1C4', 'R2C3', 'R3C2', 'R4C1']],
  [42, ['R1C9', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3', 'R8C2', 'R9C1']],
  [28, ['R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4']],
  [21, ['R7C9', 'R8C8', 'R9C7']],
];

// Edges carrying a circled 3 (difference of 3), transcribed from the
// drawn overlay dots' edge coordinates.
const diffThreeEdges = [
  ['R1C3', 'R2C3'], ['R2C3', 'R2C4'], ['R3C3', 'R3C4'], ['R3C3', 'R4C3'],
  ['R2C1', 'R3C1'], ['R4C1', 'R5C1'], ['R6C1', 'R7C1'], ['R6C2', 'R7C2'],
  ['R8C2', 'R9C2'], ['R8C4', 'R8C5'], ['R9C4', 'R9C5'], ['R8C8', 'R9C8'],
  ['R7C8', 'R8C8'], ['R7C9', 'R8C9'], ['R6C8', 'R6C9'], ['R4C8', 'R5C8'],
  ['R3C8', 'R4C8'], ['R1C9', 'R2C9'], ['R1C7', 'R1C8'], ['R1C5', 'R1C6'],
  ['R1C6', 'R2C6'], ['R2C6', 'R2C7'], ['R3C6', 'R4C6'], ['R4C5', 'R4C6'],
  ['R5C5', 'R5C6'],
];
const edgeKey = (a, b) => [a, b].sort().join('|');
const markedEdges = new Set(diffThreeEdges.map(([a, b]) => edgeKey(a, b)));

// Origin cells of every unmarked horizontal (right-neighbour) and vertical
// (down-neighbour) edge, derived from grid coordinates rather than
// hand-enumerated, so the unmarked set is exactly "all edges minus the
// drawn ones". Split by direction so each is a single Replicate template
// (a shifted copy of one Pair) instead of 119 individually-typed Pairs.
const unmarkedRightOrigins = [];
const unmarkedDownOrigins = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    if (c < 9 && !markedEdges.has(edgeKey(cell, makeCellId(r, c + 1)))) {
      unmarkedRightOrigins.push(cell);
    }
    if (r < 9 && !markedEdges.has(edgeKey(cell, makeCellId(r + 1, c)))) {
      unmarkedDownOrigins.push(cell);
    }
  }
}

const diffThreeKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 3, 9);
const notDiffThreeKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 3, 9);

return [
  new Shape('9x9'),

  ...diagonalSums.map(([sum, cells]) => new Sum(sum, ...cells)),

  ...diffThreeEdges.map(
    ([a, b], i) => new Pair(diffThreeKey, `diff3-${i}`, a, b)),

  graph.makeReplicate(
    new Pair(notDiffThreeKey, 'not-diff3-right', 'R1C1', 'R1C2'),
    unmarkedRightOrigins),
  graph.makeReplicate(
    new Pair(notDiffThreeKey, 'not-diff3-down', 'R1C1', 'R2C1'),
    unmarkedDownOrigins),
];
