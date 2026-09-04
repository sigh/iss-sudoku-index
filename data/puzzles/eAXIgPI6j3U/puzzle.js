// Title: 3X Sudoku
// Author: Sir Woezel
// Video: https://www.youtube.com/watch?v=eAXIgPI6j3U
// Source: https://cracking-the-cryptic.web.app/sudoku/rBmqrjjB4F

// Normal sudoku rules apply. No digits are given.
//
// Corner clues: each listed cell's printed number is the total of the cells
// with which it shares an edge (its own cell excluded). One corner clue, at
// R9C9, is not printed as a number -- the rules name it X and define
// X = R8C9 + R9C8, which is exactly R9C9's own two orthogonal neighbours (a
// grid corner has only two), so X is that clue's own unprinted value, not a
// separate unknown needing its own cell or Var.
//
// The marked diagonal (source arrow, corner badge "3X") enters the grid at
// R1C9 heading down-left: the anti-diagonal R1C9..R9C1. Its nine cells must
// sum to 3*X, i.e. 3*(R8C9 + R9C8).

const graph = cellGraph('9x9');

// Corner-clue cell -> printed total, as drawn (bare text overlays at grid
// corners, one per listed cell).
const cornerClues = {
  R1C3: 14, R1C7: 14,
  R2C5: 30,
  R3C5: 21,
  R5C2: 27, R5C3: 23, R5C7: 19, R5C8: 29,
  R7C5: 22,
  R8C5: 25,
  R9C3: 14, R9C7: 10,
};

const cornerSums = Object.entries(cornerClues).map(
  ([cell, total]) => new Sum(total, ...graph.neighbours(cell)));

// Anti-diagonal marked by the outside arrow: from its grid-corner entry point
// R1C9, stepping down-left to R9C1.
const diagonal = graph.ray('R1C9', 1, -1);

// diagonal sum - 3*R8C9 - 3*R9C8 = 0, i.e. diagonal sum = 3*(R8C9 + R9C8).
const diagonalSum = new Sum(
  0,
  ...diagonal.map(cell => [cell, 1]),
  ['R8C9', -3],
  ['R9C8', -3],
);

return [
  new Shape('9x9'),
  ...cornerSums,
  diagonalSum,
];
