// Title: XV Inequality Sudoku
// Author: gugunut
// Video: https://www.youtube.com/watch?v=2XTGXn1136k
// Source: https://sudokupad.app/nxbw6uuei0

// Each visible V-shaped mark is either a V clue or an upward-opening
// inequality. In the latter case, the upper cell is greater and the edge is
// not an XV edge. Every completely unmarked orthogonal edge is also not XV.

const ambiguousVEdges = [
  ['R1C1', 'R2C1'], ['R1C5', 'R2C5'], ['R1C7', 'R2C7'],
  ['R1C8', 'R2C8'], ['R1C9', 'R2C9'],
  ['R2C1', 'R3C1'], ['R2C2', 'R3C2'], ['R2C3', 'R3C3'],
  ['R2C9', 'R3C9'],
  ['R3C9', 'R4C9'],
  ['R4C1', 'R5C1'], ['R4C2', 'R5C2'], ['R4C3', 'R5C3'],
  ['R4C4', 'R5C4'], ['R4C6', 'R5C6'], ['R4C7', 'R5C7'],
  ['R4C8', 'R5C8'], ['R4C9', 'R5C9'],
  ['R5C1', 'R6C1'], ['R5C4', 'R6C4'], ['R5C6', 'R6C6'],
  ['R5C9', 'R6C9'],
  ['R6C1', 'R7C1'], ['R6C9', 'R7C9'],
  ['R7C1', 'R8C1'], ['R7C2', 'R8C2'], ['R7C8', 'R8C8'],
  ['R7C9', 'R8C9'],
  ['R8C1', 'R9C1'], ['R8C9', 'R9C9'],
];

const xEdges = [
  ['R3C1', 'R4C1'],
  ['R5C2', 'R6C2'],
  ['R8C5', 'R9C5'],
  ['R6C7', 'R6C8'],
  ['R7C5', 'R7C6'],
];

const edgeKey = ([a, b]) => [a, b].sort().join('-');
const markedEdges = new Set([...ambiguousVEdges, ...xEdges].map(edgeKey));
const graph = cellGraph('9x9');
const allEdges = [...graph.rows(), ...graph.columns()].flatMap(house =>
  house.slice(1).map((cell, index) => [house[index], cell]));
const unmarkedEdges = allEdges.filter(edge => !markedEdges.has(edgeKey(edge)));
const notXV = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);

const horizontalUnmarked = unmarkedEdges.filter(([a, b]) =>
  parseCellId(a).row === parseCellId(b).row);
const verticalUnmarked = unmarkedEdges.filter(([a, b]) =>
  parseCellId(a).col === parseCellId(b).col);

const ambiguousMarks = ambiguousVEdges.map(([upper, lower]) => new Or([
  new V(upper, lower),
  new And([
    new GreaterThan(upper, lower),
    new Pair(notXV, 'not XV', upper, lower),
  ]),
]));

return [
  new Shape('9x9'),
  ...xEdges.map(edge => new X(...edge)),
  ...ambiguousMarks,
  graph.makeReplicate(
    new Pair(notXV, 'not XV', 'R1C1', 'R1C2'),
    horizontalUnmarked.map(edge => edge[0]),
  ),
  graph.makeReplicate(
    new Pair(notXV, 'not XV', 'R1C1', 'R2C1'),
    verticalUnmarked.map(edge => edge[0]),
  ),
];
