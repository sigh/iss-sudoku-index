// Title: Stolen Numerals King XV
// Author: NurglesGift
// Video: https://www.youtube.com/watch?v=Be1ZOWa7xPw
// Source: https://sudokupad.app/w1oz8pek6a

// Normal Sudoku and anti-king rules apply. Each drawn green dot is either an
// X (sum 10) or V (sum 5); all such relationships are marked. The drawn black
// and white dots impose 1:2 and consecutive relationships respectively.
const greenDots = [
  ['R1C3', 'R1C4'], ['R1C5', 'R2C5'], ['R1C7', 'R2C7'],
  ['R1C7', 'R1C8'], ['R2C7', 'R2C8'], ['R2C9', 'R3C9'],
  ['R3C4', 'R3C5'], ['R3C1', 'R4C1'], ['R4C4', 'R4C5'],
  ['R4C6', 'R4C7'], ['R4C8', 'R4C9'], ['R4C7', 'R5C7'],
  ['R5C1', 'R5C2'], ['R5C4', 'R5C5'], ['R5C6', 'R6C6'],
  ['R6C2', 'R6C3'], ['R6C3', 'R6C4'], ['R6C7', 'R6C8'],
  ['R6C4', 'R7C4'], ['R6C1', 'R7C1'], ['R7C9', 'R8C9'],
  ['R7C8', 'R8C8'], ['R7C6', 'R8C6'], ['R7C5', 'R8C5'],
  ['R8C6', 'R8C7'], ['R8C9', 'R9C9'], ['R8C8', 'R9C8'],
];

// The pair list is the green-dot geometry drawn in the source.
const markedEdges = new Set(greenDots.map(cells => [...cells].sort().join(':')));
const graph = cellGraph('9x9');
const unmarkedEdges = graph.cells().flatMap(cell => graph.neighbours(cell)
  .filter(neighbour => cell < neighbour)
  .filter(neighbour => !markedEdges.has([cell, neighbour].sort().join(':')))
  .map(neighbour => [cell, neighbour]));
const noXV = Pair.fnToKey((a, b) => a + b !== 5 && a + b !== 10, 9);
const unmarkedByOffset = Map.groupBy(unmarkedEdges, ([from, to]) => {
  const a = parseCellId(from);
  const b = parseCellId(to);
  return `${b.row - a.row}:${b.col - a.col}`;
});
const negativeXV = [...unmarkedByOffset.values()].map(edges => {
  const [[from, to]] = edges;
  const a = parseCellId(from);
  const b = parseCellId(to);
  const origin = 'R1C1';
  const neighbour = graph.step(origin, b.row - a.row, b.col - a.col);
  return graph.makeReplicate(
    new Pair(noXV, '', origin, neighbour),
    edges.map(([start]) => start),
  );
});

return [
  new Shape('9x9'),
  new AntiKing(),
  ...greenDots.map(cells => new Or([new X(...cells), new V(...cells)])),
  // All X/V marks are given, so every unmarked orthogonal edge is neither.
  ...negativeXV,
  // Drawn Kropki dots: black at R9C1-R9C2; white at R9C2-R9C3.
  new BlackDot('R9C1', 'R9C2'),
  new WhiteDot('R9C2', 'R9C3'),
];
