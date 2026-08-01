// Title: Snow Flurry
// Author: Lurcane
// Video: https://www.youtube.com/watch?v=1MbS5RSZBGM
// Source: https://app.crackingthecryptic.com/QQ2JJHHBM8

// Normal Sudoku rules apply. White dots mark consecutive digits, and all
// possible white dots are given.
const dots = [
  ['R8C1', 'R9C1'], ['R1C1', 'R2C1'], ['R2C1', 'R2C2'],
  ['R1C2', 'R2C2'], ['R2C3', 'R3C3'], ['R4C2', 'R4C3'],
  ['R5C2', 'R6C2'], ['R7C4', 'R8C4'], ['R7C5', 'R7C6'],
  ['R8C6', 'R9C6'], ['R9C4', 'R9C5'], ['R6C5', 'R6C6'],
  ['R6C6', 'R6C7'], ['R5C4', 'R6C4'], ['R4C5', 'R5C5'],
  ['R4C6', 'R5C6'], ['R2C6', 'R3C6'], ['R2C5', 'R3C5'],
  ['R2C4', 'R3C4'], ['R1C4', 'R2C4'], ['R1C5', 'R2C5'],
  ['R1C6', 'R2C6'], ['R1C8', 'R2C8'], ['R2C8', 'R2C9'],
  ['R2C9', 'R3C9'], ['R5C7', 'R5C8'], ['R5C8', 'R6C8'],
  ['R7C8', 'R7C9'], ['R7C7', 'R8C7'], ['R8C8', 'R9C8'],
];

const dotKeys = new Set(dots.map(([a, b]) => [a, b].sort().join(':')));
// The source says every possible white dot is shown. Therefore every remaining
// orthogonal edge is a non-consecutive pair; this custom Pair key accepts only
// digit pairs whose difference is not one.
const graph = cellGraph('9x9');
const nonConsecutiveKey = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, 9);
const horizontalOrigins = graph.cells().filter(cell => {
  const right = graph.step(cell, 0, 1);
  return right && !dotKeys.has([cell, right].sort().join(':'));
});
const verticalOrigins = graph.cells().filter(cell => {
  const below = graph.step(cell, 1, 0);
  return below && !dotKeys.has([cell, below].sort().join(':'));
});
const undottedEdges = [
  graph.makeReplicate(
    new Pair(nonConsecutiveKey, 'no white dot', 'R1C1', 'R1C2'),
    horizontalOrigins),
  graph.makeReplicate(
    new Pair(nonConsecutiveKey, 'no white dot', 'R1C1', 'R2C1'),
    verticalOrigins),
];

return [
  new Shape('9x9'),
  new Given('R9C2', 1),
  ...dots.map(([a, b]) => new WhiteDot(a, b)),
  ...undottedEdges,
];
