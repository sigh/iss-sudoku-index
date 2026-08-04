// Title: April 7, 2023: Sum Sandwiches
// Author: clover!
// Video: https://www.youtube.com/watch?v=FN3oEZZizb0
// Source: https://tinyurl.com/4nanyhbc

// Normal sudoku (rows/cols/boxes all-different), plus 16 givens at the
// intersection of rows {2,4,6,8} and columns {2,4,6,8}.
//
// Outside-clue rule: a digit d named next to a row/column means the cell
// holding d in that line has its two orthogonal neighbours (within the same
// line) summing to d. Only named digits are constrained; un-named digits
// carry no such requirement. Encoded as one Or-of-And per (line, digit): for
// each interior position p that could hold the two neighbours, either p does
// not hold d (that branch is simply false), or p holds d and its neighbours
// sum to d. Interior positions exclude the two end cells of the line, which
// have only one in-line neighbour each.

// Given digits, transcribed from the grid cells carrying a value.
const givens = [
  ['R2C2', 5], ['R2C4', 7], ['R2C6', 9], ['R2C8', 8],
  ['R4C2', 8], ['R4C4', 2], ['R4C6', 1], ['R4C8', 4],
  ['R6C2', 7], ['R6C4', 8], ['R6C6', 6], ['R6C8', 2],
  ['R8C2', 9], ['R8C4', 4], ['R8C6', 8], ['R8C8', 7],
];

// Each outside clue: which row/column it sits against, and the digits shown
// in its stack (order in the stack carries no meaning), transcribed from the
// stacked text markers outside the grid.
const rowClues = [
  [2, [5, 7, 8, 9]],
  [5, [6, 9]],
  [7, [9]],
  [8, [4, 7, 9]],
];
const colClues = [
  [2, [5, 7, 8]],
  [4, [7]],
  [6, [7, 9]],
  [8, [7, 8]],
];

// Interior positions of a 9-length line: exclude the two ends, which have
// only one in-line neighbour.
const INTERIOR = [2, 3, 4, 5, 6, 7, 8];

const rowClueConstraints = rowClues.flatMap(([r, digits]) => digits.map(d =>
  new Or(INTERIOR.map(p => new And([
    new Given(makeCellId(r, p), d),
    new Sum(d, makeCellId(r, p - 1), makeCellId(r, p + 1)),
  ])))
));

const colClueConstraints = colClues.flatMap(([c, digits]) => digits.map(d =>
  new Or(INTERIOR.map(p => new And([
    new Given(makeCellId(p, c), d),
    new Sum(d, makeCellId(p - 1, c), makeCellId(p + 1, c)),
  ])))
));

return [
  new Shape('9x9'),
  ...givens.map(([cell, v]) => new Given(cell, v)),
  ...rowClueConstraints,
  ...colClueConstraints,
];
