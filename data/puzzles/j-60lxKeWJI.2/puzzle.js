// Title: Things Always Move Forward
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=j-60lxKeWJI
// Source: https://tinyurl.com/mr4d9r9w

// Normal Sudoku rules apply. Each grey line is a palindrome.
// Givens are transcribed from the puzzle grid.
const givens = [
  ['R3C3', 1], ['R3C4', 2], ['R3C5', 3], ['R3C6', 6], ['R3C7', 7],
  ['R4C3', 8], ['R4C5', 4], ['R4C7', 5],
  ['R5C3', 7], ['R5C4', 6], ['R5C5', 5], ['R5C6', 1], ['R5C7', 4],
  ['R6C3', 5], ['R6C5', 2], ['R6C7', 1],
  ['R7C3', 4], ['R7C4', 3], ['R7C5', 6], ['R7C6', 9], ['R7C7', 2],
];

// Grey-line paths are transcribed from the drawn lines, preserving their walk order.
const palindromes = [
  ['R2C4', 'R2C3', 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R4C4', 'R3C4', 'R3C3'],
  ['R2C6', 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C7', 'R4C6', 'R3C6', 'R3C7'],
  ['R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R6C7', 'R6C6', 'R7C6', 'R7C7'],
  ['R8C4', 'R8C3', 'R8C2', 'R7C2', 'R6C2', 'R6C3', 'R6C4', 'R7C4', 'R7C3'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map((cells) => new Palindrome(...cells)),
];
