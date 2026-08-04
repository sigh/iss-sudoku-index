// Title: Palindrome Sudoku
// Author: Serhii Tyshchenko
// Video: https://www.youtube.com/watch?v=-mxlYl2cXbU
// Source: https://app.crackingthecryptic.com/sudoku/63DbfLqQf4

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's `regions`).
// Each grey line is a palindrome: read the same forwards and backwards.
const givens = [
  ['R1C2', 1], ['R2C7', 3], ['R2C9', 4], ['R3C2', 2],
  ['R4C4', 7], ['R4C6', 4], ['R6C4', 8], ['R6C6', 9],
  ['R7C8', 5], ['R8C1', 7], ['R8C3', 8], ['R9C8', 6],
];
// Grey palindrome lines, from `lines[].wayPoints` interpolated to cells.
const palindromes = [
  ['R2C6', 'R3C7', 'R4C8', 'R5C8'],
  ['R2C5', 'R2C4', 'R3C3', 'R4C2'],
  ['R5C2', 'R6C2', 'R7C3', 'R8C4'],
  ['R8C5', 'R8C6', 'R7C7', 'R6C8'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map(cells => new Palindrome(...cells)),
];
