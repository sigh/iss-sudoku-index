// Title: Sandwich Additives
// Author: DiMono
// Video: https://www.youtube.com/watch?v=EPixkKjLj4A
// Source: https://sudokupad.app/s7e0q68rum

// Standard sudoku. Every clue outside the grid is either a Sandwich total
// (sum of the digits strictly between the 1 and the 9 in that row/column) or
// an X-Sum (sum of the first X cells seen from the clue, X = the nearest
// cell's own digit) - and every clue on one side of the grid shares the same
// type, but which side is which type is for the solver to determine, not
// given. Encoded below as one Or(all-Sandwich, all-X-Sum) per side.
//
// The top side is the one exception: six of its seven clues read "0", and an
// X-Sum total can never be 0 (the nearest cell's own digit, 1-9, always
// counts toward its own sum, so the total is always >= 1) - so the top side
// can only be the all-Sandwich reading. Building an X-Sum(0) constraint is
// not just unsatisfiable, it is invalid input to the class itself, so no Or
// is constructed for the top side; it is encoded as plain Sandwich clues.
//
// Two clues are printed as ">0" rather than a number (bottom of column 7,
// right of row 6) - not a number ISS's Sandwich/X-Sum classes accept. Read
// literally per candidate type: as a Sandwich clue it means the total is
// nonzero, i.e. 1 and 9 are not orthogonally adjacent in that line (encoded
// as a Pair forbidding that adjacency); as an X-Sum clue it is automatically
// true (every X-Sum total is >= 1, per the note above) and contributes no
// constraint.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Sandwich total > 0 <=> the 1 and the 9 are not directly adjacent in the
// line (otherwise there are zero cells, hence zero total, between them).
const notAdjacent19Key = Pair.fnToKey(
  (a, b) => !((a === 1 && b === 9) || (a === 9 && b === 1)), 9);
const notAdjacent19 = (...cells) =>
  new Pair(notAdjacent19Key, 'sandwich total > 0', ...cells);

// -- Top: forced all-Sandwich (see note above). Provenance: text entries
// R0C1=0, R0C2=0, R0C3=0, R0C5=23, R0C7=0, R0C8=0, R0C9=0.
const topClues = [[1, 0], [2, 0], [3, 0], [5, 23], [7, 0], [8, 0], [9, 0]];
const topConstraints = topClues.map(([col, value]) =>
  Sandwich.fromCells(value, graph.column(col), geometry));

// -- Bottom: Or(all-Sandwich, all-X-Sum). Provenance: text entries
// R10C1=32, R10C4=10, R10C7=">0".
const bottomSandwich = [
  Sandwich.fromCells(32, graph.column(1), geometry),
  Sandwich.fromCells(10, graph.column(4), geometry),
  notAdjacent19(...graph.column(7)),
];
const bottomXSum = [
  XSum.fromCells(32, graph.column(1).slice().reverse(), geometry),
  XSum.fromCells(10, graph.column(4).slice().reverse(), geometry),
  // Column 7's ">0" is vacuously true under X-Sum: no constraint added.
];
const bottomConstraint = new Or([new And(bottomSandwich), new And(bottomXSum)]);

// -- Left: Or(all-Sandwich, all-X-Sum). Provenance: text entries
// R2C0=22, R4C0=22, R6C0=24, R7C0=19, R8C0=25.
const leftClues = [[2, 22], [4, 22], [6, 24], [7, 19], [8, 25]];
const leftSandwich = leftClues.map(([row, value]) =>
  Sandwich.fromCells(value, graph.row(row), geometry));
const leftXSum = leftClues.map(([row, value]) =>
  XSum.fromCells(value, graph.row(row), geometry));
const leftConstraint = new Or([new And(leftSandwich), new And(leftXSum)]);

// -- Right: Or(all-Sandwich, all-X-Sum). Provenance: text entries
// R2C10=15, R3C10=24, R4C10=21, R6C10=">0", R8C10=12.
const rightSandwich = [
  Sandwich.fromCells(15, graph.row(2), geometry),
  Sandwich.fromCells(24, graph.row(3), geometry),
  Sandwich.fromCells(21, graph.row(4), geometry),
  notAdjacent19(...graph.row(6)),
  Sandwich.fromCells(12, graph.row(8), geometry),
];
const rightXSum = [
  XSum.fromCells(15, graph.row(2).slice().reverse(), geometry),
  XSum.fromCells(24, graph.row(3).slice().reverse(), geometry),
  XSum.fromCells(21, graph.row(4).slice().reverse(), geometry),
  // Row 6's ">0" is vacuously true under X-Sum: no constraint added.
  XSum.fromCells(12, graph.row(8).slice().reverse(), geometry),
];
const rightConstraint = new Or([new And(rightSandwich), new And(rightXSum)]);

return [
  new Shape('9x9'),
  ...topConstraints,
  bottomConstraint,
  leftConstraint,
  rightConstraint,
];
