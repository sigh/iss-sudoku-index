// Title: Detached Regions of Seven
// Author: Md88keys
// Video: https://www.youtube.com/watch?v=ZxoM9EjCj0A
// Source: https://sudokupad.app/okh6idt7fe

// Place 0-6 once in every row, column, and marked seven-cell region. Six
// regions are each split into two orthogonally connected components; the
// seventh is connected. The fixed region membership directly captures that
// geometry, so disconnected regions remain single Jigsaw constraints.
//
// Cage digits may repeat and sum to 5. All Xs are given. All Vs are given
// except between two cells in the same cage.

const shape = new Shape('7x7', '0-6');
const graph = cellGraph(shape);

const regions = [
  ['R1C1', 'R1C2', 'R1C6', 'R1C7', 'R2C2', 'R2C3', 'R3C3'],
  ['R1C3', 'R1C4', 'R1C5', 'R2C1', 'R2C4', 'R3C1', 'R3C2'],
  ['R2C7', 'R3C7', 'R4C4', 'R4C6', 'R4C7', 'R5C6', 'R6C6'],
  ['R2C5', 'R3C4', 'R3C5', 'R4C2', 'R4C3', 'R5C2', 'R5C3'],
  ['R4C1', 'R5C7', 'R6C5', 'R6C7', 'R7C5', 'R7C6', 'R7C7'],
  ['R2C6', 'R3C6', 'R4C5', 'R5C4', 'R5C5', 'R6C3', 'R6C4'],
  ['R5C1', 'R6C1', 'R6C2', 'R7C1', 'R7C2', 'R7C3', 'R7C4'],
];

const cages = [
  ['R1C2', 'R1C3', 'R1C4', 'R2C2', 'R2C3'],
  ['R3C5', 'R3C6', 'R3C7'],
  ['R4C5', 'R5C4', 'R5C5'],
  ['R6C5', 'R7C4', 'R7C5', 'R7C6'],
  ['R5C3', 'R6C3'],
  ['R5C1', 'R6C1', 'R6C2'],
  ['R3C2', 'R4C2'],
];

const edgeKey = (a, b) => [a, b].sort().join('-');
const edges = graph.cells().flatMap(cell => [
  graph.step(cell, 0, 1),
  graph.step(cell, 1, 0),
].filter(Boolean).map(neighbour => [cell, neighbour]));

const xEdge = edgeKey('R7C1', 'R7C2');
const sameCageEdges = new Set(cages.flatMap(cage => {
  const cells = new Set(cage);
  return cage.flatMap(cell => graph.neighbours(cell)
    .filter(neighbour => cells.has(neighbour))
    .map(neighbour => edgeKey(cell, neighbour)));
}));

const notX = Pair.fnToKey((a, b) => a + b !== 10, shape);
const notV = Pair.fnToKey((a, b) => a + b !== 5, shape);

return [
  shape,
  new NoBoxes(),
  ...regions.map(cells => new Jigsaw('7x7', ...cells)),
  ...cages.map(cells => new Sum(5, ...cells)),
  new X('R7C1', 'R7C2'),
  ...edges
    .filter(cells => edgeKey(...cells) !== xEdge)
    .map(cells => new Pair(notX, 'not X', ...cells)),
  ...edges
    .filter(cells => !sameCageEdges.has(edgeKey(...cells)))
    .map(cells => new Pair(notV, 'not V', ...cells)),
];
