// Title: Limiting Factors
// Author: Scruffamudda
// Video: https://www.youtube.com/watch?v=MMe5c_zxF0k
// Source: https://sudokupad.app/MDBMQfF877

// Normal sudoku. Orthogonally adjacent digits are not consecutive. A grey
// circle or square is not a multiple or divisor of any orthogonally adjacent
// digit; circles are odd and squares are even.

const shape = new Shape('9x9');
const graph = cellGraph(shape);

// The seven light-grey underlays, transcribed by shape from the drawing.
const CIRCLES = ['R1C5', 'R3C5', 'R6C1'];
const SQUARES = ['R3C1', 'R4C5', 'R5C6', 'R6C3'];
const specialCells = new Set([...CIRCLES, ...SQUARES]);

// Each undirected orthogonal edge touching a marked cell is constrained once.
const markedEdges = [];
const markedEdgeKeys = new Set();
for (const cell of specialCells) {
  for (const neighbour of graph.neighbours(cell)) {
    const edge = [cell, neighbour].sort();
    const key = edge.join('|');
    if (!markedEdgeKeys.has(key)) {
      markedEdgeKeys.add(key);
      markedEdges.push(edge);
    }
  }
}

const notMultipleOrDivisor = Pair.fnToKey((a, b) =>
  a % b !== 0 && b % a !== 0, shape);

return [
  shape,
  new AntiConsecutive(),
  ...CIRCLES.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...SQUARES.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...markedEdges.map(([a, b]) =>
    new Pair(notMultipleOrDivisor, 'not multiple or divisor', a, b)),
];
