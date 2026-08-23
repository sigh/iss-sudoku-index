// Title: Palindromes Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=WxgEvD-UXDM
// Source: https://app.crackingthecryptic.com/sudoku/qB2PLPbq63

// Normal sudoku rules apply. Grey lines are palindromes, reading the same
// each way: for each line, `Palindrome` mirrors the cell list about its
// midpoint. All six lines are open paths, so no wrap-around cell is needed.

const givens = [
  ['R1C4', 1], ['R1C5', 2], ['R1C6', 3], ['R1C7', 4], ['R1C8', 5], ['R1C9', 6],
  ['R2C2', 5],
  ['R4C1', 4],
  ['R5C4', 7], ['R5C5', 8], ['R5C6', 9],
  ['R6C9', 5],
  ['R8C8', 2],
  ['R9C1', 1], ['R9C2', 2], ['R9C3', 3], ['R9C4', 4], ['R9C5', 5], ['R9C6', 6],
];

const palindromes = [
  ['R1C2', 'R1C3', 'R2C4', 'R3C4'],
  ['R2C1', 'R3C1', 'R4C2', 'R4C3'],
  ['R5C1', 'R6C2', 'R7C3', 'R8C4'],
  ['R2C6', 'R3C7', 'R4C8', 'R5C9'],
  ['R6C7', 'R6C8', 'R7C9', 'R8C9'],
  ['R7C6', 'R8C6', 'R9C7', 'R9C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
