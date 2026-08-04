// Title: January 3, 2023: Best Friends
// Author: clover!
// Video: https://www.youtube.com/watch?v=B8l5A-lrSJA
// Source: https://tinyurl.com/49zhsu9r

// Normal sudoku rules apply. A clue on the border of a row or column gives an
// unordered pair of digits that must occupy two cells adjacent within that
// row (horizontally) or column (vertically) -- somewhere along the line, not
// a fixed position, and in either order.
// Ten clues are given: rows 1,3,5,7,9 (text at R1C0/R3C0/R5C0/R7C0/R9C0) and
// columns 1,3,5,7,9 (text at R0C1/R0C3/R0C5/R0C7/R0C9). Column 0 / row 0 in
// the payload is the outside border, per the SudokuPad coordinate convention
// (row-first, 0-indexed): a clue with C0 sits left of its row, a clue with R0
// sits above its column.

const givens = [
  ['R1C2', 1], ['R1C4', 2], ['R1C6', 3],
  ['R2C9', 6],
  ['R3C5', 5],
  ['R4C1', 7], ['R4C9', 5],
  ['R5C3', 3], ['R5C7', 9],
  ['R6C1', 5], ['R6C9', 4],
  ['R7C5', 8],
  ['R8C1', 6],
  ['R9C4', 3], ['R9C6', 4], ['R9C8', 2],
].map(([cell, v]) => new Given(cell, v));

// "Digits a and b occupy some adjacent pair of cells in `cells`, in either
// order": an Or over every adjacent domino in the line, each domino tested
// with a Pair whose custom relation accepts either ordering of {a, b}.
const adjacentPairSomewhere = (cells, a, b) => {
  const key = Pair.fnToKey(
    (x, y) => (x === a && y === b) || (x === b && y === a), 9);
  const dominoes = [];
  for (let i = 0; i + 1 < cells.length; i++) {
    dominoes.push(new Pair(key, `${a}${b}`, cells[i], cells[i + 1]));
  }
  return new Or(dominoes);
};

const row = r => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(c => makeCellId(r, c));
const col = c => [1, 2, 3, 4, 5, 6, 7, 8, 9].map(r => makeCellId(r, c));

// Row clues: [row, digit a, digit b] (source: R1C0="4 5", R3C0="4 7",
// R5C0="7 9", R7C0="4 7", R9C0="7 8").
const rowClues = [
  [1, 4, 5],
  [3, 4, 7],
  [5, 7, 9],
  [7, 4, 7],
  [9, 7, 8],
].map(([r, a, b]) => adjacentPairSomewhere(row(r), a, b));

// Column clues: [col, digit a, digit b] (source: R0C1="3 4", R0C3="5 7",
// R0C5="8 9", R0C7="2 4", R0C9="7 8").
const colClues = [
  [1, 3, 4],
  [3, 5, 7],
  [5, 8, 9],
  [7, 2, 4],
  [9, 7, 8],
].map(([c, a, b]) => adjacentPairSomewhere(col(c), a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...rowClues,
  ...colClues,
];
