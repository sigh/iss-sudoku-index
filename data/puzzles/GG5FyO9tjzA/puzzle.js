// Title: Restricted Access
// Author: Kennet's Dad
// Video: https://www.youtube.com/watch?v=GG5FyO9tjzA
// Source: https://sudokupad.app/2iaiw4r5o5

// Normal Sudoku; the blue main diagonal has no repeated digit. Blue squares are even.
const evens = ['R1C5', 'R4C7', 'R5C2', 'R5C8', 'R6C3', 'R9C5'];

// The drawn V, X, and black-dot pairs, transcribed from the visible edge marks.
const vPairs = [
  ['R8C2', 'R9C2'], ['R7C3', 'R8C3'], ['R7C3', 'R7C4'],
  ['R6C4', 'R7C4'], ['R6C4', 'R6C5'], ['R4C5', 'R4C6'],
  ['R3C6', 'R4C6'], ['R3C6', 'R3C7'], ['R2C7', 'R3C7'],
  ['R1C8', 'R2C8'],
];
const xPairs = [['R7C7', 'R8C7'], ['R8C6', 'R8C7']];
const blackDotPairs = [['R6C1', 'R7C1'], ['R3C9', 'R4C9']];

// All V clues are given, whereas X and black-dot clues are not exhaustive.
const vKeys = new Set(vPairs.map(([a, b]) => [a, b].sort().join(',')));
const graph = cellGraph('9x9');
const noV = Pair.fnToKey((x, y) => x + y !== 5, 9);
const horizontalNoVOrigins = graph.cells().filter(a => {
  const b = graph.step(a, 0, 1);
  return b && !vKeys.has([a, b].sort().join(','));
});
const verticalNoVOrigins = graph.cells().filter(a => {
  const b = graph.step(a, 1, 0);
  return b && !vKeys.has([a, b].sort().join(','));
});
// The predicate excludes unmarked sum-to-five edges in each orientation.
const negativeVs = [
  graph.makeReplicate(new Pair(noV, '', 'R1C1', 'R1C2'), horizontalNoVOrigins),
  graph.makeReplicate(new Pair(noV, '', 'R1C1', 'R2C1'), verticalNoVOrigins),
];

return [
  new Shape('9x9'),
  new Given('R1C3', 5),
  new Given('R9C7', 5),
  new Diagonal(-1),
  ...evens.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...vPairs.map(cells => new V(...cells)),
  ...xPairs.map(cells => new X(...cells)),
  ...blackDotPairs.map(cells => new BlackDot(...cells)),
  ...negativeVs,
];
