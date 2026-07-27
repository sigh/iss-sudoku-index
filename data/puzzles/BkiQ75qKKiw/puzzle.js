// Title: sphinx of black quartz
// Author: aqjhs
// Video: https://www.youtube.com/watch?v=BkiQ75qKKiw
// Source: https://sudokupad.app/kkny0tykl7

// Normal sudoku rules apply. No given digits.
//
// Antiknight: identical digits cannot be a knight's move apart.
// Palindrome (grey line): digits read the same from either end.
// White dot: joined digits are consecutive; V: joined digits sum to 5.
// Both "all possible dots are given" and "all such [V] pairs are given" are
// exhaustive-mark rules, but over disjoint relations (consecutive vs sum-5),
// so each gets its own negative -- StrictKropki/StrictXV would additionally
// forbid the unrelated ratio-2/sum-10 relation, which the rules never state.

const graph = cellGraph('9x9');

const antiKnight = new AntiKnight();

// Grey palindrome line, transcribed from the drawn waypoints (row-first,
// interpolated through the diagonal run R2C7..R6C3).
const palindromeLine = new Palindrome(
  'R1C5', 'R2C5', 'R2C6', 'R2C7', 'R3C6', 'R4C5', 'R5C4', 'R6C3',
  'R7C4', 'R8C3', 'R9C4', 'R9C3', 'R9C2', 'R9C1');

// The two drawn white-dot edges (consecutive).
const whiteDotEdges = [
  ['R7C5', 'R8C5'],
  ['R8C5', 'R8C6'],
];

// The two drawn V edges (sum to 5).
const vEdges = [
  ['R5C5', 'R6C5'],
  ['R4C8', 'R5C8'],
];

// Every orthogonally-adjacent cell pair not carrying a drawn white dot must
// not be consecutive; every pair not carrying a drawn V must not sum to 5.
// Built once per relation as a Pair template and stamped across every valid
// horizontal/vertical origin with Replicate, rather than hand-listing edges.
const notConsecutiveKey = Pair.fnToKey((a, b) => a !== b + 1 && a !== b - 1, 9);
const notSum5Key = Pair.fnToKey((a, b) => a + b !== 5, 9);

const dotEdgeKeys = new Set(whiteDotEdges.map(([a, b]) => [a, b].sort().join('-')));
const vEdgeKeys = new Set(vEdges.map(([a, b]) => [a, b].sort().join('-')));

const undottedOrigins = { horizontal: [], vertical: [] };
const unVedOrigins = { horizontal: [], vertical: [] };
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right) {
    const key = [cell, right].sort().join('-');
    if (!dotEdgeKeys.has(key)) undottedOrigins.horizontal.push(cell);
    if (!vEdgeKeys.has(key)) unVedOrigins.horizontal.push(cell);
  }
  const down = graph.step(cell, 1, 0);
  if (down) {
    const key = [cell, down].sort().join('-');
    if (!dotEdgeKeys.has(key)) undottedOrigins.vertical.push(cell);
    if (!vEdgeKeys.has(key)) unVedOrigins.vertical.push(cell);
  }
}

const negativeConstraints = [
  graph.makeReplicate(
    new Pair(notConsecutiveKey, 'not consecutive', 'R1C1', 'R1C2'),
    undottedOrigins.horizontal),
  graph.makeReplicate(
    new Pair(notConsecutiveKey, 'not consecutive', 'R1C1', 'R2C1'),
    undottedOrigins.vertical),
  graph.makeReplicate(
    new Pair(notSum5Key, 'not sum 5', 'R1C1', 'R1C2'),
    unVedOrigins.horizontal),
  graph.makeReplicate(
    new Pair(notSum5Key, 'not sum 5', 'R1C1', 'R2C1'),
    unVedOrigins.vertical),
];

return [
  new Shape('9x9'),

  antiKnight,
  palindromeLine,

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...vEdges.map(([a, b]) => new V(a, b)),
  ...negativeConstraints,
];
