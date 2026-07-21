// Title: Scientist's Region Sum Guy
// Author: LNOMISL
// Video: https://www.youtube.com/watch?v=LZWnotnH9Dk
// Source: https://sudokupad.app/mfkxzniwrh

// Box borders divide each coloured line into segments. All segments of a
// colour have the same sum; the dark-blue and light-blue sums are independent.
const darkBlueSegments = [
  ['R1C6', 'R2C5', 'R2C6'],
  ['R8C4', 'R9C5', 'R9C4'],
  ['R5C8', 'R6C9'],
  ['R7C9', 'R8C9', 'R8C8', 'R7C8'],
  ['R4C2', 'R4C1', 'R5C1', 'R6C2'],
];

const lightBlueSegments = [
  ['R7C4', 'R7C5', 'R7C6'],
  ['R8C7', 'R9C8'],
  ['R6C5', 'R5C5', 'R4C5'],
  ['R8C2', 'R7C3'],
  ['R6C4', 'R5C4', 'R4C4'],
  ['R5C2', 'R4C3'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R6C6', 'R5C6', 'R4C6'],
  ['R3C7', 'R2C8'],
];

// Black dots mark a 1:2 ratio. Since all black dots are given, every other
// orthogonally adjacent pair must not be in that ratio.
const blackDots = [
  ['R4C4', 'R4C5'],
  ['R4C5', 'R4C6'],
];
const graph = cellGraph('9x9');
const edgeKey = (a, b) => [a, b].sort().join('-');
const blackDotEdges = new Set(blackDots.map(([a, b]) => edgeKey(a, b)));
const nonRatioKey = Pair.fnToKey((a, b) => a !== 2 * b && b !== 2 * a, 9);
const undottedEdges = [];
for (const cell of graph.cells()) {
  for (const neighbour of graph.neighbours(cell)) {
    if (cell < neighbour && !blackDotEdges.has(edgeKey(cell, neighbour))) {
      undottedEdges.push([cell, neighbour]);
    }
  }
}
const negativeRatioConstraints = [
  graph.makeReplicate(
    new Pair(nonRatioKey, 'not 1:2', 'R1C1', 'R1C2'),
    undottedEdges
      .filter(([a, b]) => parseCellId(a).row === parseCellId(b).row)
      .map(([a]) => a),
  ),
  graph.makeReplicate(
    new Pair(nonRatioKey, 'not 1:2', 'R1C1', 'R2C1'),
    undottedEdges
      .filter(([a, b]) => parseCellId(a).col === parseCellId(b).col)
      .map(([a]) => a),
  ),
];

return [
  new Shape('9x9'),
  new EqualSum(...darkBlueSegments),
  new EqualSum(...lightBlueSegments),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...negativeRatioConstraints,
  new V('R1C4', 'R2C4'),
  new Given('R2C8', 1, 3, 5, 7, 9),
];
