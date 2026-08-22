// Title: Xmas sums with a difference
// Author: Secret Santa
// Video: https://www.youtube.com/watch?v=iH5uEC3fF7A
// Source: https://app.crackingthecryptic.com/sudoku/NprLbBQGtD

// Normal sudoku rules apply on the 9x9 grid (standard 3x3 boxes, no givens).
//
// Outside clues: the sum of the first X digits along that row/column, where
// X is the first (nearest) such digit -- ISS's built-in X-Sum semantics, so
// each clue is built with XSum.fromCells from the actual line of cells
// ordered starting at the cell nearest the clue.
//
// Bauble/star circles: the circle's own digit equals the absolute
// difference between the sum of one attached line and the sum of the other.
// The rules never say which line is "one" and which is "the other", so each
// circle is encoded as an Or of both orientations of a linear equation
// (sum(lineA) - sum(lineB) - circle = 0, or with the circle's sign flipped);
// this is the same relation either way since it is an absolute difference.

const geometry = cellGeometry('9x9');
const graph = cellGraph('9x9');
const reversed = cells => cells.slice().reverse();

// Outside clue values and directed cell order, transcribed from the drawn
// circle overlays outside the board edge.
const outsideSums = [
  [25, graph.column(3)],            // top C3
  [12, graph.column(5)],            // top C5
  [20, graph.column(7)],            // top C7
  [21, graph.column(8)],            // top C8
  [10, reversed(graph.column(4))],  // bottom C4
  [39, reversed(graph.column(6))],  // bottom C6
  [23, graph.row(2)],               // left R2
  [38, graph.row(6)],               // left R6
  [18, reversed(graph.row(2))],     // right R2
  [6, reversed(graph.row(4))],      // right R4
  [35, reversed(graph.row(8))],     // right R8
];

// Bauble/star circle and its two attached lines (branch cells only, circle
// cell excluded), transcribed from the drawn grey line waypoints.
const circles = [
  { circle: 'R4C3', lineA: ['R4C4'], lineB: ['R3C4'] },
  { circle: 'R4C7', lineA: ['R4C6'], lineB: ['R3C6'] },
  { circle: 'R6C2', lineA: ['R6C3', 'R6C4'], lineB: ['R5C3'] },
  { circle: 'R6C8', lineA: ['R6C7', 'R6C6'], lineB: ['R5C7'] },
  { circle: 'R8C1', lineA: ['R8C2', 'R8C3'], lineB: ['R7C2'] },
  { circle: 'R8C9', lineA: ['R8C8', 'R8C7'], lineB: ['R7C8'] },
  {
    circle: 'R6C5',
    lineA: ['R7C5', 'R8C5', 'R9C5'],
    lineB: ['R5C5', 'R4C5', 'R3C5', 'R2C5'],
  },
  { circle: 'R1C5', lineA: ['R2C4'], lineB: ['R2C6'] },
];

// oneSide's total equals otherSide's total plus control, i.e. control
// equals oneSide-total minus otherSide-total.
function diffEquation(control, oneSide, otherSide) {
  return new EqualSum(oneSide, [...otherSide, control]);
}

const circleConstraints = circles.map(({ circle, lineA, lineB }) => new Or([
  diffEquation(circle, lineA, lineB),
  diffEquation(circle, lineB, lineA),
]));

return [
  new Shape('9x9'),
  ...outsideSums.map(([value, cells]) => XSum.fromCells(value, cells, geometry)),
  ...circleConstraints,
];
