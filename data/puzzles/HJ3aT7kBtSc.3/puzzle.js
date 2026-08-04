// Title: Jan. 20: Cogito Ergo Sum to 5n
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=HJ3aT7kBtSc
// Source: https://tinyurl.com/ms47u6n2

// Normal sudoku rules apply. A circle joining two orthogonally-adjacent cells
// marks their sum: 'V' = 5, 'X' = 10, 'XV' = 15. Every possible multiple-of-5
// adjacent pair is marked, so every unmarked adjacent pair must NOT sum to 5,
// 10, or 15 (rules: "All possible multiple-of-5 pairs are given (if an
// adjacent pair of digits does not have a clue, the digits cannot sum to
// 5, 10, or 15)").

const givens = [
  new Given('R1C7', 1),
  new Given('R3C1', 3),
  new Given('R7C9', 7),
  new Given('R9C3', 9),
];

// The 28 drawn sum circles, each spanning two cells.
const marks = [
  ['R2C3', 'R1C3', 'X'],
  ['R2C4', 'R3C4', 'X'],
  ['R2C3', 'R2C4', 'XV'],
  ['R4C2', 'R5C2', 'XV'],
  ['R6C2', 'R7C2', 'XV'],
  ['R8C4', 'R8C5', 'XV'],
  ['R5C9', 'R6C9', 'XV'],
  ['R1C5', 'R1C6', 'XV'],
  ['R2C5', 'R2C6', 'V'],
  ['R3C6', 'R3C5', 'X'],
  ['R3C6', 'R4C6', 'X'],
  ['R4C8', 'R4C7', 'X'],
  ['R3C8', 'R4C8', 'V'],
  ['R3C8', 'R3C9', 'X'],
  ['R5C8', 'R6C8', 'V'],
  ['R5C7', 'R6C7', 'X'],
  ['R6C6', 'R6C7', 'X'],
  ['R8C6', 'R7C6', 'X'],
  ['R8C6', 'R8C7', 'V'],
  ['R8C7', 'R9C7', 'X'],
  ['R9C4', 'R9C5', 'V'],
  ['R7C5', 'R7C4', 'X'],
  ['R6C4', 'R7C4', 'X'],
  ['R6C3', 'R6C2', 'X'],
  ['R4C3', 'R5C3', 'X'],
  ['R4C4', 'R4C3', 'X'],
  ['R7C1', 'R7C2', 'X'],
  ['R4C1', 'R5C1', 'V'],
];

// Native X/V classes cover sum-10 and sum-5 pairs; there is no built-in class
// for sum-15, so those use a custom Pair with an exact-sum predicate.
const sum15Key = Pair.fnToKey((a, b) => a + b === 15, 9);
const sumClues = marks.map(([a, b, type]) => {
  if (type === 'X') return new X(a, b);
  if (type === 'V') return new V(a, b);
  return new Pair(sum15Key, 'XV: sum 15', a, b);
});

// Negative constraint: every adjacent pair NOT drawn as a circle must not sum
// to 5, 10, or 15 (see rules note above). Enumerate every orthogonal edge of
// the grid, split by offset (rightward / downward), and subtract the marked
// ones from each.
const graph = cellGraph('9x9');
const markedKeys = new Set(marks.map(([a, b]) => [a, b].sort().join('-')));
const isMarked = (a, b) => markedKeys.has([a, b].sort().join('-'));

const rightEdges = [];
const downEdges = [];
for (const cell of graph.cells()) {
  const right = graph.step(cell, 0, 1);
  if (right && !isMarked(cell, right)) rightEdges.push(cell);
  const down = graph.step(cell, 1, 0);
  if (down && !isMarked(cell, down)) downEdges.push(cell);
}

const notFiveTenFifteenKey = Pair.fnToKey(
  (a, b) => a + b !== 5 && a + b !== 10 && a + b !== 15, 9);

// One Replicate per edge offset stamps the same two-cell template (rightward,
// then downward) over every unmarked edge's origin cell.
const negatives = [
  graph.makeReplicate(
    new Pair(notFiveTenFifteenKey, 'not V/X/XV', 'R1C1', 'R1C2'), rightEdges),
  graph.makeReplicate(
    new Pair(notFiveTenFifteenKey, 'not V/X/XV', 'R1C1', 'R2C1'), downEdges),
];

return [
  new Shape('9x9'),
  ...givens,
  ...sumClues,
  ...negatives,
];
