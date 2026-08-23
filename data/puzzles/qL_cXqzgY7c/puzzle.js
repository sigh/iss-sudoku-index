// Title: The Factory
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=qL_cXqzgY7c
// Source: https://app.crackingthecryptic.com/sudoku/TDbnnNbp9t

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Digits cannot repeat within a cage, and each cage's cells sum
// to its shown total: Cage(sum, ...cells). Identical digits cannot be within
// a king's move of each other -- a king's move is orthogonal or diagonal
// adjacency, but orthogonal-adjacent cells always share a row or column, so
// normal sudoku already forbids repeats there; the rule's parenthetical
// "(i.e. cannot touch diagonally)" names the only case it actually adds.
// AntiKing enforces the full king's-move relation, which is exactly this
// rule since it is redundant, not stricter, on the orthogonal cases.

const cages = [
  // Cage cell lists transcribed from the puzzle's drawn cage geometry.
  [15, 'R1C5', 'R2C5'],
  [10, 'R2C1', 'R2C2'],
  [12, 'R5C3', 'R5C4'],
  [8, 'R5C6', 'R5C7'],
  [6, 'R6C2', 'R6C3'],
  [8, 'R6C7', 'R6C8'],
  [32, 'R6C4', 'R6C5', 'R6C6', 'R7C4', 'R7C6', 'R8C4', 'R8C6'],
  [5, 'R7C5', 'R8C5'],
  [9, 'R7C3', 'R8C3'],
  [12, 'R7C8', 'R8C8'],
  [17, 'R9C7', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
