// Title: Palindrome Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=sMi5DXZSwa4
// Source: https://app.crackingthecryptic.com/sudoku/m8gPhGRrfg

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's `regions`).
// Each grey line is a palindrome: read the same forwards and backwards.
const givens = [
  ['R1C3', 2], ['R1C5', 3], ['R1C7', 4],
  ['R2C4', 9], ['R2C6', 5],
  ['R5C1', 3], ['R5C2', 2], ['R5C8', 7], ['R5C9', 8],
  ['R8C4', 5], ['R8C6', 4],
  ['R9C1', 5], ['R9C3', 6], ['R9C7', 8], ['R9C9', 9],
];
// Grey palindrome lines, from `lines[].wayPoints` interpolated to cells.
const palindromes = [
  ['R2C1', 'R3C2', 'R4C3'],
  ['R2C3', 'R3C4', 'R4C5'],
  ['R2C5', 'R3C6', 'R4C7'],
  ['R2C7', 'R3C8', 'R4C9'],
  ['R6C1', 'R7C2', 'R8C3'],
  ['R6C3', 'R7C4', 'R8C5'],
  ['R6C5', 'R7C6', 'R8C7'],
  ['R6C7', 'R7C8', 'R8C9'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
