// Title: May 28, 2023: Diagonal Consecutive Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=g4GVEbgzQrA
// Source: https://tinyurl.com/mw2p62d7

// Normal sudoku rules apply (standard rows/columns/boxes, from Shape('9x9')).
// Marked pairs of diagonally adjacent digits are consecutive; all possible
// pairs are marked, so every unmarked diagonally-adjacent pair (either
// orientation) must NOT be consecutive. The 5 marks are short strokes
// crossing a diagonal grid-line corner; each connects the up-left and
// down-right cell of the crossed corner. All 5 drawn marks run "\"; no "/"
// marks are drawn anywhere, so every "/" pair in the grid is unmarked.

// The 5 diagonal-consecutive marks, transcribed from the drawn corner strokes
// (crossed grid-line corner -> its up-left/down-right cell pair).
const marked = [
  ['R3C5', 'R4C6'],
  ['R4C4', 'R5C5'],
  ['R4C5', 'R5C6'],
  ['R5C4', 'R6C5'],
  ['R5C5', 'R6C6'],
];

const consecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);
const nonConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);

const consecutivePairs = marked.map(
  ([a, b]) => new Pair(consecutiveKey, 'diagonal consecutive', a, b));

const graph = cellGraph('9x9');
const markedKeySet = new Set(marked.map(([a, b]) => `${a}_${b}`));

// Every "\" (down-right) and "/" (down-left) diagonal-neighbour cell pair in
// the grid, computed from the grid rather than hand-enumerated.
const downRight = [];
const downLeft = [];
for (const cell of graph.cells()) {
  const dr = graph.step(cell, 1, 1);
  if (dr) downRight.push([cell, dr]);
  const dl = graph.step(cell, 1, -1);
  if (dl) downLeft.push([cell, dl]);
}
const unmarkedDownRight = downRight.filter(([a, b]) => !markedKeySet.has(`${a}_${b}`));

const nonConsecutivePair = (a, b) =>
  new Pair(nonConsecutiveKey, 'diagonal non-consecutive', a, b);

// "\": R1C1 (graph.makeReplicate's fixed origin) is itself a valid
// down-right pair start, so the built-in helper anchors directly on it.
const nonConsecutiveDownRight = graph.makeReplicate(
  nonConsecutivePair('R1C1', 'R2C2'),
  unmarkedDownRight.map(([a]) => a));

// "/": R1C1 has no down-left neighbour, so makeReplicate's fixed R1C1 origin
// cannot anchor this family; anchor the template at its own natural start
// cell instead.
const nonConsecutiveDownLeft = new Replicate(
  [nonConsecutivePair(...downLeft[0])],
  Replicate.encodeTargetCells(downLeft.map(([a]) => a), downLeft[0][0], graph),
  downLeft[0][0],
);

return [
  new Shape('9x9'),

  new Given('R1C2', 5),
  new Given('R1C8', 2),
  new Given('R2C1', 1),
  new Given('R2C2', 3),
  new Given('R2C4', 8),
  new Given('R2C6', 9),
  new Given('R2C8', 4),
  new Given('R2C9', 6),
  new Given('R3C5', 6),
  new Given('R5C3', 3),
  new Given('R5C7', 7),
  new Given('R7C5', 9),
  new Given('R8C1', 4),
  new Given('R8C2', 6),
  new Given('R8C4', 1),
  new Given('R8C6', 2),
  new Given('R8C8', 7),
  new Given('R8C9', 9),
  new Given('R9C2', 8),
  new Given('R9C8', 5),

  ...consecutivePairs,
  nonConsecutiveDownRight,
  nonConsecutiveDownLeft,
];
