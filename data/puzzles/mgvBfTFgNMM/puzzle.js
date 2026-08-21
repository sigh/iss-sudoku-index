// Title: Same But Different
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=mgvBfTFgNMM
// Source: https://app.crackingthecryptic.com/sudoku/hD4NfR2JM9

// Normal sudoku rules. Fourteen outside clues, each a colour-filled circle
// showing "15", sit in the lane cells around the grid. Each clue is a
// Sandwich, X-Sum or Little Killer clue; red, blue and green name a
// one-to-one assignment of the three types to the three colours, which the
// rules never spell out, so all six assignments are Or'd together below.
// Grey clues are independently any of the three types.
//   Sandwich: the cells strictly between the 1 and the 9 of that row/column
//     sum to 15 (direction irrelevant).
//   X-Sum: the first X cells counted from the clue's side sum to 15, X being
//     the digit in the nearest of them.
//   Little Killer: a diagonal pointing away from the clue sums to 15,
//     repeats allowed.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const VALUE = 15;

// Clue positions and colours, transcribed from the drawn outside-clue
// overlays: each circle's centre gives the side and the row/column it sits
// beside, and its colour is the fill of the underlay sharing that centre
// (#A3E048 green, #34BBE6 blue, #E6261F red, #CFCFCF grey).
const CLUES = [
  { side: 'top', n: 2, color: 'grey' },
  { side: 'top', n: 3, color: 'grey' },
  { side: 'top', n: 9, color: 'blue' },
  { side: 'left', n: 1, color: 'grey' },
  { side: 'left', n: 3, color: 'green' },
  { side: 'left', n: 4, color: 'grey' },
  { side: 'left', n: 7, color: 'green' },
  { side: 'left', n: 8, color: 'green' },
  { side: 'left', n: 9, color: 'green' },
  { side: 'right', n: 3, color: 'red' },
  { side: 'right', n: 4, color: 'red' },
  { side: 'right', n: 8, color: 'blue' },
  { side: 'right', n: 9, color: 'blue' },
  { side: 'bottom', n: 6, color: 'grey' },
];

// The clue's row/column, ordered from the clue's side inward. X-Sum counts in
// this order; Sandwich accepts either order.
const lineCells = ({ side, n }) => ({
  left: () => graph.row(n),
  right: () => graph.row(n).slice().reverse(),
  top: () => graph.column(n),
  bottom: () => graph.column(n).slice().reverse(),
}[side]());

// The lane cell each clue occupies, in grid coordinates extended by one ring
// (row/col 0 and 10 lie outside the 9x9 board).
const LANE = {
  left: (n) => [n, 0], right: (n) => [n, 10],
  top: (n) => [0, n], bottom: (n) => [10, n],
};
// The two diagonal directions leading away from that lane cell into the grid.
const OUTWARD_DIRS = {
  left: [[1, 1], [-1, 1]], right: [[1, -1], [-1, -1]],
  top: [[1, 1], [1, -1]], bottom: [[-1, 1], [-1, -1]],
};
const inGrid = (r, c) => r >= 1 && r <= 9 && c >= 1 && c <= 9;

// "A diagonal pointing away from the clue" starts where the clue points: at
// the cell diagonally adjacent to its lane cell, not at the orthogonally
// adjacent cell in its own row/column. No clue carries a drawn arrow or
// shaft -- they are plain circles, since a shaft would give away which clues
// are Little Killers -- so the rules fix the two candidate directions but
// nothing chooses between them, and both are kept as a disjunction below.
// A ray reaching only one cell is dropped: a single digit cannot make 15.
const diagonalRays = ({ side, n }) => {
  const [laneRow, laneCol] = LANE[side](n);
  return OUTWARD_DIRS[side]
    .map(([dr, dc]) => [laneRow + dr, laneCol + dc, dr, dc])
    .filter(([r, c]) => inGrid(r, c))
    .map(([r, c, dr, dc]) => graph.ray(makeCellId(r, c), dr, dc))
    .filter(ray => ray.length >= 2);
};

const sandwich = (clue) => Sandwich.fromCells(VALUE, lineCells(clue), geometry);
const xsum = (clue) => XSum.fromCells(VALUE, lineCells(clue), geometry);
const littleKiller = (clue) => {
  const options = diagonalRays(clue).map(
    ray => LittleKiller.fromCells(VALUE, ray, geometry));
  return options.length === 1 ? options[0] : new Or(options);
};

const TYPE_FN = { Sandwich: sandwich, XSum: xsum, LittleKiller: littleKiller };
const TYPES = Object.keys(TYPE_FN);
const COLORS = ['red', 'blue', 'green'];
const cluesOf = (color) => CLUES.filter(c => c.color === color);

const permutations = (arr) => arr.length <= 1 ? [arr] : arr.flatMap(
  (item, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)])
    .map(rest => [item, ...rest]));

// One branch per colour-to-type assignment (3! = 6), each building every
// red/blue/green clue with that branch's type.
const colorAssignmentBranches = permutations(TYPES).map(assignment => new And(
  COLORS.flatMap((color, i) => cluesOf(color).map(
    clue => TYPE_FN[assignment[i]](clue)))));

return [
  new Shape('9x9'),
  new Given('R5C3', 8),
  new Given('R5C4', 3),
  new Given('R6C2', 9),
  new Given('R6C5', 5),
  new Or(colorAssignmentBranches),
  ...cluesOf('grey').map(clue => new Or(TYPES.map(t => TYPE_FN[t](clue)))),
];
