// Title: Same But Different
// Author: Marvin Kannhauser
// Video: https://www.youtube.com/watch?v=mgvBfTFgNMM
// Source: https://app.crackingthecryptic.com/sudoku/hD4NfR2JM9

// Normal sudoku rules. 14 outside clues, all showing "15", are colour-coded
// red/blue/green/grey. Red, blue and green each name exactly one of
// {Sandwich, X-Sum, Little Killer} (a bijection), but the rules never say
// which colour gets which type, so every bijection is tried and Or'd
// together below. Grey clues may independently be any of the three types.
//   Sandwich: cells strictly between the 1 and the 9 in that row/column
//     sum to 15 (direction irrelevant).
//   X-Sum: the first X cells counted from the clue's side sum to 15, X
//     being the digit in the nearest of those cells.
//   Little Killer: a diagonal running away from the clue sums to 15,
//     repeats allowed. None of the 14 clues has a drawn arrow/shaft, so
//     where a clue's position leaves two non-degenerate diagonals running
//     away from it, both are tried as a disjunction; where only one
//     direction reaches a second cell (the other would need to sum to 15
//     from a single digit <= 9, impossible), only that one is used.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const VALUE = 15;

// Clue positions and colours, transcribed from the drawn outside-clue
// overlays: each one's [row,col] centre gives the side and row/column
// number, and the colour comes from the underlay sharing that centre
// (fill #A3E048 green, #34BBE6 blue, #E6261F red, #CFCFCF grey).
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

// The row/column cells for a clue, ordered from the clue's side inward.
// X-Sum needs this exact (forward) order; Sandwich accepts either order.
const lineCells = ({ side, n }) => {
  switch (side) {
    case 'left': return graph.row(n);
    case 'right': return graph.row(n).slice().reverse();
    case 'top': return graph.column(n);
    case 'bottom': return graph.column(n).slice().reverse();
  }
};

// The grid cell nearest a clue, and the two diagonal directions that run
// away from it into the grid.
const nearCell = ({ side, n }) => ({
  left: makeCellId(n, 1), right: makeCellId(n, 9),
  top: makeCellId(1, n), bottom: makeCellId(9, n),
}[side]);
const DIAGONAL_DIRS = {
  left: [[1, 1], [-1, 1]], right: [[1, -1], [-1, -1]],
  top: [[1, -1], [1, 1]], bottom: [[-1, 1], [-1, -1]],
};

// Every diagonal ray running away from this clue that reaches a second
// cell (a 1-cell "diagonal" could never sum to 15, so it is never live).
const diagonalRays = (clue) => DIAGONAL_DIRS[clue.side]
  .map(([dr, dc]) => graph.ray(nearCell(clue), dr, dc))
  .filter(ray => ray.length >= 2);

const sandwich = (clue) => Sandwich.fromCells(VALUE, lineCells(clue), geometry);
const xsum = (clue) => XSum.fromCells(VALUE, lineCells(clue), geometry);
const littleKiller = (clue) => {
  const options = diagonalRays(clue).map(ray => LittleKiller.fromCells(VALUE, ray, geometry));
  return options.length === 1 ? options[0] : new Or(options);
};
const TYPE_FN = { Sandwich: sandwich, XSum: xsum, LittleKiller: littleKiller };
const TYPES = Object.keys(TYPE_FN);
const COLORS = ['red', 'blue', 'green'];
const coloredClues = (color) => CLUES.filter(c => c.color === color);

const permutations = (arr) => arr.length <= 1 ? [arr] : arr.flatMap(
  (item, i) => permutations([...arr.slice(0, i), ...arr.slice(i + 1)])
    .map(rest => [item, ...rest]));

// One branch per colour-to-type bijection (3! = 6): every red/blue/green
// clue built with that branch's type.
const colorBijectionBranches = permutations(TYPES).map(assignment => new And(
  COLORS.flatMap((color, i) => coloredClues(color).map(clue => TYPE_FN[assignment[i]](clue)))
));

// Each grey clue is independently any of the three types.
const greyConstraints = coloredClues('grey').map(
  clue => new Or(TYPES.map(t => TYPE_FN[t](clue))));

return [
  new Shape('9x9'),
  new Given('R5C3', 8),
  new Given('R5C4', 3),
  new Given('R6C2', 9),
  new Given('R6C5', 5),
  new Or(colorBijectionBranches),
  ...greyConstraints,
];
