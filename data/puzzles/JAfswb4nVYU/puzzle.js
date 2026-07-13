// Title: Horsing Around
// Author: Tim Hasselaar
// Video: https://www.youtube.com/watch?v=JAfswb4nVYU
// Source: https://sudokupad.app/3di357jqj1

// Normal sudoku. Red parity line: every pair of consecutive cells along the
// line contains one even and one odd digit. Minimum cells (drawn with inward
// arrows): smaller than every orthogonal neighbour. Black Kropki dots: the
// two digits have a 1:2 ratio.
//
// Omitted: Henry the horse's knight-move journey (visits every 1, may visit
// a 5 but never twice in a row, starts on the green circle, ends on the 9th
// 1, never revisits a cell, and cannot jump over the drawn blue walls unless
// a knight move goes around them). This is a solver-discovered, self-avoiding,
// order-dependent path with maze-style wall exceptions, which has no direct
// equivalent among the built-in constraints below.

const givens = [
  new Given('R3C9', 3),
  new Given('R7C5', 9),
  new Given('R8C7', 3),
];

// Red parity line, drawn as 4 separate strokes that touch at shared cells;
// every edge listed here is a drawn consecutive pair.
const parityEdges = [
  ['R7C2', 'R7C1'], ['R7C1', 'R8C1'], ['R8C1', 'R8C2'], ['R8C2', 'R7C3'],
  ['R7C3', 'R8C3'], ['R8C3', 'R9C3'], ['R9C3', 'R9C2'], ['R9C2', 'R9C1'],
  ['R7C3', 'R6C4'], ['R6C4', 'R6C5'], ['R6C5', 'R5C6'],
  ['R6C4', 'R5C4'], ['R5C4', 'R4C4'], ['R4C4', 'R4C5'], ['R4C5', 'R5C5'],
  ['R5C3', 'R5C2'], ['R5C2', 'R5C1'], ['R5C1', 'R4C1'],
];

const differentParity = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const parityLine = parityEdges.map(
  ([a, b]) => new Pair(differentParity, 'red-parity', a, b));

// Minimum cells (inward-pointing arrows): each is smaller than every
// orthogonal neighbour it has.
const minCells = [
  { cell: 'R8C2', neighbours: ['R7C2', 'R9C2', 'R8C1', 'R8C3'] },
  { cell: 'R8C4', neighbours: ['R7C4', 'R9C4', 'R8C3', 'R8C5'] },
];
const minCellConstraints = minCells.flatMap(
  ({ cell, neighbours }) => neighbours.map(
    (neighbour) => new GreaterThan(neighbour, cell)));

// Black Kropki dots (1:2 ratio).
const blackDots = [
  ['R2C3', 'R2C4'],
  ['R1C3', 'R2C3'],
  ['R4C4', 'R4C5'],
  ['R5C6', 'R5C7'],
  ['R7C4', 'R8C4'],
  ['R6C4', 'R7C4'],
  ['R5C8', 'R6C8'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...parityLine,
  ...minCellConstraints,
  ...blackDots,
];
