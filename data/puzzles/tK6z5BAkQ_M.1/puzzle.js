// Title: Dec 4, 2021: Triplet Sum
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=tK6z5BAkQ_M
// Source: https://tinyurl.com/2p8t5z9k

// Normal sudoku rules apply (default row/column/box all-different).
// Outside clue: "If a clue is given outside the grid, then there must be
// three consecutive cells somewhere in that row or column which sum to the
// clue value." The rule does not fix which three cells, so each clue is a
// disjunction over the lane's 7 possible windows of 3 consecutive cells
// (starting positions 1-3 through 7-9). A row or column may carry a clue on
// each end; each is independent -- nothing requires the two windows to
// differ or coincide.

const givens = [
  ['R2C6', 2], ['R3C5', 1], ['R4C2', 2], ['R5C3', 1],
  ['R5C7', 2], ['R6C8', 1], ['R7C5', 2], ['R8C4', 1],
];

// Row clues: side is left ('L') or right ('R') of the grid, drawn as a
// number printed just outside that row; only the row number and value
// matter to the encoding.
const rowClues = [
  ['L', 2, 8], ['R', 2, 24],
  ['L', 4, 23], ['R', 4, 14],
  ['L', 5, 22], ['R', 5, 10],
  ['L', 6, 24], ['R', 6, 16],
  ['L', 8, 8], ['R', 8, 21],
];

// Column clues: side is top ('T') or bottom ('B') of the grid, drawn as a
// number printed just outside that column.
const colClues = [
  ['T', 2, 6], ['B', 2, 24],
  ['T', 5, 22],
  ['B', 4, 8],
  ['B', 6, 23],
  ['T', 8, 7], ['B', 8, 21],
];

const windowStarts = [1, 2, 3, 4, 5, 6, 7]; // 3-cell windows within a 9-cell lane

const tripletSum = (value, cellAt) => new Or(
  windowStarts.map(start =>
    new Sum(value, cellAt(start), cellAt(start + 1), cellAt(start + 2))));

const rowConstraints = rowClues.map(([, row, value]) =>
  tripletSum(value, col => makeCellId(row, col)));

const colConstraints = colClues.map(([, col, value]) =>
  tripletSum(value, row => makeCellId(row, col)));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...rowConstraints,
  ...colConstraints,
];
