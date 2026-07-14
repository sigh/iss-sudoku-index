// Title: Reborn hooligan ghost
// Author: Lithium-Ion
// Video: https://www.youtube.com/watch?v=q43M_ngwQtw
// Source: https://sudokupad.app/1b5i3a2d2d

// Normal sudoku. A circled digit equals the sum of all orthogonally adjacent cells.

const circles = [
  ['R9C3', 'R8C3', 'R9C2', 'R9C4'],
  ['R7C2', 'R6C2', 'R8C2', 'R7C1', 'R7C3'],
  ['R9C8', 'R8C8', 'R9C7', 'R9C9'],
  ['R7C9', 'R6C9', 'R8C9', 'R7C8'],
  ['R5C1', 'R4C1', 'R6C1', 'R5C2'],
  ['R2C1', 'R1C1', 'R3C1', 'R2C2'],
  ['R4C6', 'R3C6', 'R5C6', 'R4C5', 'R4C7'],
  ['R3C9', 'R2C9', 'R4C9', 'R3C8'],
  ['R1C7', 'R2C7', 'R1C6', 'R1C8'],
];

const circleCells = new Set(circles.map(([center]) => center));
const graph = cellGraph('9x9');
const cells = graph.cells();

const notCircle = NFA.encodeSpec({
  startState: { i: 0, center: 0, sum: 0 },
  transition({ i, center, sum }, value) {
    if (i === 0) {
      return { i: 1, center: value, sum: 0 };
    }
    return { i: i + 1, center, sum: sum + value };
  },
  accept({ i, center, sum }) {
    return i > 1 && sum !== center;
  },
  maxDepth: 5,
}, 9);

const notCircleAt = cell => new NFA(notCircle, 'not-circle', cell, ...graph.neighbours(cell));
const nonCircleTargets = targets => targets.filter(cell => !circleCells.has(cell));

const corners = ['R1C1', 'R1C9', 'R9C1', 'R9C9'];
const topEdge = graph.row('R1C1').slice(1, -1);
const bottomEdge = graph.row('R9C1').slice(1, -1);
const leftEdge = graph.column('R1C1').slice(1, -1);
const rightEdge = graph.column('R1C9').slice(1, -1);
const interiors = cells.filter(cell => {
  const { row, col } = parseCellId(cell);
  return row > 1 && row < 9 && col > 1 && col < 9;
});

// Fixed topology templates, each normalized to the R1C1 bounding anchor.
// The constrained center need not itself be the replication anchor.
const topEdgeNotCircles = graph.makeReplicate(
  new NFA(notCircle, 'not-circle', 'R1C2', 'R2C2', 'R1C1', 'R1C3'),
  nonCircleTargets(topEdge).map(cell => graph.step(cell, 0, -1)));
const bottomEdgeNotCircles = graph.makeReplicate(
  new NFA(notCircle, 'not-circle', 'R2C2', 'R1C2', 'R2C1', 'R2C3'),
  nonCircleTargets(bottomEdge).map(cell => graph.step(cell, -1, -1)));
const leftEdgeNotCircles = graph.makeReplicate(
  new NFA(notCircle, 'not-circle', 'R2C1', 'R1C1', 'R3C1', 'R2C2'),
  nonCircleTargets(leftEdge).map(cell => graph.step(cell, -1, 0)));
const rightEdgeNotCircles = graph.makeReplicate(
  new NFA(notCircle, 'not-circle', 'R2C2', 'R1C2', 'R3C2', 'R2C1'),
  nonCircleTargets(rightEdge).map(cell => graph.step(cell, -1, -1)));
const interiorNotCircles = graph.makeReplicate(
  new NFA(notCircle, 'not-circle', 'R2C2', 'R1C2', 'R3C2', 'R2C1', 'R2C3'),
  nonCircleTargets(interiors).map(cell => graph.step(cell, -1, -1)));

return [
  new Shape('9x9'),
  ...circles.map(([center, ...orthogonal]) => new Arrow(center, ...orthogonal)),
  ...nonCircleTargets(corners).map(notCircleAt),
  topEdgeNotCircles,
  bottomEdgeNotCircles,
  leftEdgeNotCircles,
  rightEdgeNotCircles,
  interiorNotCircles,
];
