// Title: X Marks The ????
// Author: Molly Boodey
// Video: https://www.youtube.com/watch?v=-yEgaKEOL-Q
// Source: https://sudokupad.app/xd80bvl2nu

// Normal Sudoku, purple renbans, all black Kropki ratio dots (so unmarked
// orthogonal pairs are not 1:2), and explicitly marked non-negative X sums.

const renbans = [
  ['R2C1', 'R1C2', 'R1C3', 'R2C4', 'R3C3', 'R4C3'],
  ['R7C4', 'R7C3', 'R6C2', 'R7C1', 'R8C1', 'R9C2'],
  ['R6C7', 'R7C7', 'R8C6', 'R9C7', 'R9C8', 'R8C9'],
  ['R3C6', 'R3C7', 'R4C8', 'R3C9', 'R2C9', 'R1C8'],
];
const blackDots = [
  ['R3C5', 'R3C6'], ['R7C4', 'R7C5'],
  ['R4C3', 'R5C3'], ['R5C7', 'R6C7'],
];
const xs = [
  ['R7C3', 'R7C4'], ['R7C1', 'R8C1'], ['R8C4', 'R9C4'], ['R2C1', 'R2C2'],
  ['R4C1', 'R5C1'], ['R4C3', 'R4C4'], ['R5C3', 'R5C4'], ['R7C5', 'R8C5'],
  ['R8C3', 'R8C4'], ['R5C4', 'R6C4'], ['R2C6', 'R2C7'], ['R2C6', 'R3C6'],
  ['R1C9', 'R2C9'], ['R2C8', 'R3C8'], ['R5C8', 'R6C8'], ['R7C6', 'R7C7'],
  ['R8C8', 'R8C9'], ['R9C8', 'R9C9'], ['R6C9', 'R7C9'], ['R7C7', 'R8C7'],
];

const graph = cellGraph('9x9');
const edgeKey = (a, b) => [a, b].sort().join('/');
const markedDotEdges = new Set(blackDots.map(([a, b]) => edgeKey(a, b)));
const noRatio = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const unmarkedStarts = (dRow, dCol) => graph.cells().filter(cell => {
  const other = graph.step(cell, dRow, dCol);
  return other !== null && !markedDotEdges.has(edgeKey(cell, other));
});
const noHiddenDots = [
  graph.makeReplicate(
    new Pair(noRatio, 'no hidden black dot', 'R1C1', 'R1C2'),
    unmarkedStarts(0, 1),
  ),
  graph.makeReplicate(
    new Pair(noRatio, 'no hidden black dot', 'R1C1', 'R2C1'),
    unmarkedStarts(1, 0),
  ),
];

return [
  new Shape('9x9'),
  ...renbans.map(cells => new Renban(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...noHiddenDots,
  ...xs.map(cells => new X(...cells)),
];
