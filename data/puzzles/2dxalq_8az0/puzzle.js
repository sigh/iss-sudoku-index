// Title: The Heated Quincunx
// Author: Justin Smart
// Video: https://www.youtube.com/watch?v=2dxalq_8az0
// Source: https://sudokupad.app/8gmuzm89hx

// Normal Sudoku, thermometers, disjoint box positions, white dots,
// and nonconsecutive orthogonal neighbours wherever no white dot is drawn.
const shape = new Shape('9x9');
// Grey thermometer strokes, listed from their matching circular bulbs.
const thermometers = [
  ['R2C8', 'R3C8', 'R2C7', 'R1C8'],
  ['R2C2', 'R3C2', 'R2C1', 'R1C2'],
  ['R5C5', 'R6C5', 'R5C4', 'R4C5'],
  ['R8C2', 'R9C2', 'R8C1', 'R7C2'],
  ['R8C8', 'R9C8', 'R8C7', 'R7C8'],
];
// White circular marks centred on these shared cell borders.
const dots = [
  ['R1C3', 'R1C4'], ['R1C6', 'R2C6'],
  ['R3C4', 'R4C4'], ['R3C3', 'R4C3'],
  ['R3C2', 'R4C2'], ['R3C1', 'R4C1'],
  ['R6C1', 'R7C1'], ['R6C2', 'R7C2'],
  ['R6C3', 'R7C3'], ['R6C4', 'R7C4'],
  ['R7C6', 'R8C6'], ['R9C3', 'R9C4'],
];
const edgeKey = (a, b) => [a, b].sort().join('|');
const marked = new Set(dots.map(([a, b]) => edgeKey(a, b)));
const graph = cellGraph(shape);
// The predicate forbids consecutive values only, since the rules name white dots.
const nonconsecutive = Pair.fnToKey((a, b) => Math.abs(a - b) !== 1, shape);
// Separate horizontal and vertical templates cover every undotted edge once.
const negatives = [[0, 1], [1, 0]].map(([dr, dc]) => {
  const targets = graph.cells().filter(a => {
    const b = graph.step(a, dr, dc);
    return b && !marked.has(edgeKey(a, b));
  });
  return graph.makeReplicate(
    new Pair(nonconsecutive, 'No white dot', 'R1C1', graph.step('R1C1', dr, dc)),
    targets);
});
return [
  shape,
  new DisjointSets(),
  ...thermometers.map(cells => new Thermo(...cells)),
  ...dots.map(cells => new WhiteDot(...cells)),
  ...negatives,
];
