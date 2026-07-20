// Title: Raining ten clues
// Author: Patrick Junke
// Video: https://www.youtube.com/watch?v=Z5AyHRWh-fo
// Source: https://sudokupad.app/bos0gb2wea

// Standard Sudoku, six distinct-digit cages summing to 10, and a global
// negative X rule: exactly the marked orthogonal pairs sum to 10.

const graph = cellGraph('9x9');
const cells = graph.cells();

const xPairs = [
  ['R1C8', 'R2C8'],
  ['R2C9', 'R3C9'],
  ['R3C8', 'R4C8'],
  ['R4C9', 'R5C9'],
  ['R7C9', 'R8C9'],
  ['R9C8', 'R9C9'],
  ['R8C7', 'R9C7'],
  ['R8C6', 'R9C6'],
  ['R8C5', 'R9C5'],
  ['R7C4', 'R7C5'],
  ['R6C4', 'R7C4'],
  ['R5C5', 'R6C5'],
  ['R4C4', 'R5C4'],
  ['R5C3', 'R6C3'],
  ['R8C2', 'R8C3'],
  ['R4C6', 'R5C6'],
  ['R3C3', 'R3C4'],
  ['R1C4', 'R2C4'],
];
const xEdgeKeys = new Set(xPairs.map(pair => [...pair].sort().join('-')));
const unmarkedStarts = (dRow, dCol) => cells.filter(cell => {
  const other = graph.step(cell, dRow, dCol);
  return other && !xEdgeKeys.has([cell, other].sort().join('-'));
});

// StrictXV would also forbid unmarked V pairs. The puzzle gives only a negative
// X rule, so replicate the custom not-sum-10 relation over unmarked edges.
const notX = Pair.fnToKey((a, b) => a + b !== 10, 9);
const horizontalNotX = graph.makeReplicate(
  new Pair(notX, 'not X', 'R1C1', 'R1C2'),
  unmarkedStarts(0, 1));
const verticalNotX = graph.makeReplicate(
  new Pair(notX, 'not X', 'R1C1', 'R2C1'),
  unmarkedStarts(1, 0));

return [
  new Shape('9x9'),

  new Cage(10, 'R2C8', 'R3C8', 'R3C9'),
  new Cage(10, 'R5C8', 'R6C7', 'R6C8'),
  new Cage(10, 'R1C2', 'R1C3', 'R2C2'),
  new Cage(10, 'R4C1', 'R4C2', 'R5C2'),
  new Cage(10, 'R5C3', 'R5C4', 'R6C4'),
  new Cage(10, 'R2C4', 'R3C4', 'R4C4'),

  ...xPairs.map(([a, b]) => new X(a, b)),
  horizontalNotX,
  verticalNotX,
];
