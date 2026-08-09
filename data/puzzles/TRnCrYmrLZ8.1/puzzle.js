// Title: Sept. 14, 2022: Entropy Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=TRnCrYmrLZ8
// Source: https://tinyurl.com/hp9tyrb3

// Normal sudoku rules apply (default row/column/box all-different).
//
// Every 2x2 square must contain at least one low digit (1-3), one middle
// digit (4-6), and one high digit (7-9): the built-in GlobalEntropy
// constraint is exactly this 9x9 rule.

return [
  new Shape('9x9'),
  new GlobalEntropy(),
];
