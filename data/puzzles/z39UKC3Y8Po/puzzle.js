// Title: Who's Afraid Of 13?
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=z39UKC3Y8Po
// Source: https://sudokupad.app/s34y05j3cz

// Normal Sudoku. Orthogonally adjacent cells sum to at most 13, and cells
// related by a 180-degree rotation about the grid centre sum to 10.
const graph = cellGraph('9x9');

const atMostThirteenKey = Pair.fnToKey((a, b) => a + b <= 13, 9);
const horizontalStarts = graph.cells().filter(cell => graph.step(cell, 0, 1));
const verticalStarts = graph.cells().filter(cell => graph.step(cell, 1, 0));
const neighbourSumCap = [
  graph.makeReplicate(
    new Pair(atMostThirteenKey, 'orthogonal neighbours sum to at most 13',
      'R1C1', 'R1C2'),
    horizontalStarts,
  ),
  graph.makeReplicate(
    new Pair(atMostThirteenKey, 'orthogonal neighbours sum to at most 13',
      'R1C1', 'R2C1'),
    verticalStarts,
  ),
];

// The first 40 row-major cells pair with the corresponding cells under a
// half-turn. R5C5 is the fixed point of the rotation, so it is given as 5.
const symmetricSums = graph.cells().slice(0, 40).map(cell => {
  const {row, col} = parseCellId(cell);
  return new Sum(10, cell, makeCellId(10 - row, 10 - col));
});

return [
  new Shape('9x9'),
  new Given('R1C4', 9),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R8C1', 6),
  ...neighbourSumCap,
  ...symmetricSums,
];
