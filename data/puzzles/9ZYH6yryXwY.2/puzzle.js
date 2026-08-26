// Title: 11/30/22: Overthrowing bakpao
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=9ZYH6yryXwY
// Source: https://tinyurl.com/2p8f7sw7

// Normal sudoku rules apply. Identical digits cannot appear in cells a chess
// king's move apart. A king's orthogonal neighbours already share a row or
// column, so normal sudoku forbids repeats there regardless; the extra reach
// AntiKing adds beyond the drawn rule is diagonal adjacency only, which is
// exactly what the rule states, so AntiKing and this rule coincide.

// Given digits, transcribed from the payload's grid values.
const givens = [
  ['R1C6', 9],
  ['R2C5', 7],
  ['R3C3', 5], ['R3C4', 1], ['R3C5', 2], ['R3C6', 6], ['R3C7', 8],
  ['R4C1', 9], ['R4C3', 7], ['R4C7', 4],
  ['R5C2', 8], ['R5C3', 3], ['R5C7', 1], ['R5C8', 6],
  ['R6C3', 2], ['R6C7', 5], ['R6C9', 9],
  ['R7C3', 6], ['R7C4', 8], ['R7C5', 4], ['R7C6', 3], ['R7C7', 7],
  ['R8C5', 5],
  ['R9C4', 9],
];

return [
  new Shape('9x9'),
  new AntiKing(),
  ...givens.map(([cell, value]) => new Given(cell, value)),
];
