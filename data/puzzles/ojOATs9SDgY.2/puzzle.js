// Title: April 24, 2022: Sum Frame
// Author: clover!
// Video: https://www.youtube.com/watch?v=ojOATs9SDgY
// Source: https://tinyurl.com/k6dh9vzk

// Normal sudoku rules apply. Each outside-grid total gives the sum of the
// three cells nearest that edge in the named row/column. The three cells lie
// in one row or column, so they are already all-different by the row/column
// rule -- the clue itself asserts only a sum, not a separate distinctness
// requirement, so each is a plain Sum rather than a Cage.

const leftSums = {
  1: 6,
  2: 15,
  3: 24,
  6: 15,
};

const rightSums = {
  4: 10,
  7: 22,
  8: 15,
  9: 8,
};

const topSums = {
  4: 15,
  7: 23,
  8: 15,
  9: 7,
};

const bottomSums = {
  1: 9,
  2: 15,
  3: 21,
  6: 10,
};

const frameSums = [
  ...Object.entries(leftSums).map(([row, sum]) => new Sum(
    sum, makeCellId(+row, 1), makeCellId(+row, 2), makeCellId(+row, 3))),
  ...Object.entries(rightSums).map(([row, sum]) => new Sum(
    sum, makeCellId(+row, 7), makeCellId(+row, 8), makeCellId(+row, 9))),
  ...Object.entries(topSums).map(([col, sum]) => new Sum(
    sum, makeCellId(1, +col), makeCellId(2, +col), makeCellId(3, +col))),
  ...Object.entries(bottomSums).map(([col, sum]) => new Sum(
    sum, makeCellId(7, +col), makeCellId(8, +col), makeCellId(9, +col))),
];

return [
  new Shape('9x9'),

  // Givens.
  new Given('R1C3', 2),
  new Given('R1C4', 8),
  new Given('R1C7', 9),
  new Given('R3C1', 8),
  new Given('R3C9', 1),
  new Given('R4C9', 5),
  new Given('R6C1', 9),
  new Given('R7C1', 3),
  new Given('R7C9', 6),
  new Given('R9C3', 7),
  new Given('R9C6', 6),
  new Given('R9C7', 4),

  ...frameSums,
];
