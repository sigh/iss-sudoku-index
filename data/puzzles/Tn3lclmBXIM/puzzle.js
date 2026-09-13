// Title: The Ant(i) Farm
// Author: HDev
// Video: https://www.youtube.com/watch?v=Tn3lclmBXIM
// Source: https://sudokupad.app/3yyqe1we8y

// Normal sudoku rules apply (rows, columns, 3x3 boxes).
//
// A network of brown tunnel segments is drawn between some orthogonally
// adjacent cell pairs (`tunnelEdges` below, transcribed from the puzzle's
// drawn lines). Every pair directly joined by a segment must have a ratio
// (larger divided by smaller) of exactly 2, 3, or 4; every other orthogonally
// adjacent pair -- since all segments are shown -- must never have that
// ratio. `nonTunnelEdges` is derived as every grid adjacency minus the drawn
// set, so it can't drift from `tunnelEdges`.
//
// A red circle on R1C6 and a green circle on R9C5 each anchor two diagonal
// rays running to the board edge; each circle's two rays have equal sums.
// The shared circle cell is dropped from both rays before comparing, since a
// term common to both sides of an equality cancels out.

const graph = cellGraph('9x9');

// Drawn tunnel segments (brown lines), transcribed from the puzzle's drawn
// line geometry.
const tunnelEdges = [
  ['R1C1', 'R1C2'], ['R1C2', 'R1C3'], ['R1C2', 'R2C2'], ['R1C5', 'R2C5'],
  ['R1C7', 'R1C8'], ['R1C7', 'R2C7'], ['R1C8', 'R1C9'], ['R1C9', 'R2C9'],
  ['R2C2', 'R2C3'], ['R2C3', 'R2C4'], ['R2C3', 'R3C3'], ['R2C5', 'R3C5'],
  ['R2C6', 'R2C7'], ['R2C6', 'R3C6'], ['R2C7', 'R3C7'], ['R3C2', 'R3C3'],
  ['R3C2', 'R4C2'], ['R3C3', 'R3C4'], ['R3C4', 'R3C5'], ['R3C4', 'R4C4'],
  ['R3C5', 'R4C5'], ['R3C6', 'R3C7'], ['R4C1', 'R4C2'], ['R4C2', 'R5C2'],
  ['R4C4', 'R4C5'], ['R4C4', 'R5C4'], ['R4C5', 'R4C6'], ['R4C6', 'R4C7'],
  ['R4C6', 'R5C6'], ['R4C8', 'R5C8'], ['R5C1', 'R5C2'], ['R5C1', 'R6C1'],
  ['R5C2', 'R5C3'], ['R5C6', 'R5C7'], ['R5C7', 'R6C7'], ['R5C8', 'R6C8'],
  ['R6C1', 'R6C2'], ['R6C1', 'R7C1'], ['R6C7', 'R6C8'], ['R6C7', 'R7C7'],
  ['R6C8', 'R6C9'], ['R6C8', 'R7C8'], ['R7C3', 'R8C3'], ['R7C6', 'R7C7'],
  ['R7C7', 'R7C8'], ['R7C8', 'R8C8'], ['R7C9', 'R8C9'], ['R8C1', 'R8C2'],
  ['R8C1', 'R9C1'], ['R8C2', 'R8C3'], ['R8C4', 'R9C4'], ['R8C5', 'R9C5'],
  ['R9C3', 'R9C4'], ['R9C5', 'R9C6'],
];

const edgeKey = (a, b) => [a, b].sort().join('-');
const tunnelKeys = new Set(tunnelEdges.map(([a, b]) => edgeKey(a, b)));

// Every orthogonally adjacent grid pair, deduplicated.
const allEdges = [];
const seenEdges = new Set();
for (const cell of graph.cells()) {
  for (const neighbour of graph.neighbours(cell)) {
    const key = edgeKey(cell, neighbour);
    if (seenEdges.has(key)) continue;
    seenEdges.add(key);
    allEdges.push([cell, neighbour]);
  }
}
const nonTunnelEdges = allEdges.filter(
  ([a, b]) => !tunnelKeys.has(edgeKey(a, b)));

const hasBigRatio = (a, b) => {
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return hi % lo === 0 && [2, 3, 4].includes(hi / lo);
};
const ratioKey = Pair.fnToKey(hasBigRatio, 9);
const noRatioKey = Pair.fnToKey((a, b) => !hasBigRatio(a, b), 9);

const tunnelPairs = tunnelEdges.map(
  ([a, b]) => new Pair(ratioKey, 'tunnel ratio 2/3/4', a, b));
const nonTunnelPairs = nonTunnelEdges.map(
  ([a, b]) => new Pair(noRatioKey, 'no tunnel: not ratio 2/3/4', a, b));

// Diagonal rays from each circle, excluding the shared circle cell.
const redDownRight = graph.ray('R1C6', 1, 1).slice(1);
const redDownLeft = graph.ray('R1C6', 1, -1).slice(1);
const greenUpLeft = graph.ray('R9C5', -1, -1).slice(1);
const greenUpRight = graph.ray('R9C5', -1, 1).slice(1);

const diagonalSums = [
  new EqualSum(redDownRight, redDownLeft),
  new EqualSum(greenUpLeft, greenUpRight),
];

return [
  new Shape('9x9'),
  ...tunnelPairs,
  ...nonTunnelPairs,
  ...diagonalSums,
];
