// Title: 1-2-'21
// Author: Frans Wentholt; Jurre Klinkenberg
// Video: https://www.youtube.com/watch?v=1w8R6sX7RZA
// Source: https://app.crackingthecryptic.com/sudoku/n2h6jQjB8D

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's `regions`).
// Identical digits cannot be a knight's move apart.
// Each grey line is a palindrome: read the same forwards and backwards.
const givens = [
  ['R2C2', 1], ['R2C3', 8], ['R2C4', 7],
  ['R3C2', 2], ['R3C4', 6],
  ['R4C2', 3], ['R4C3', 4], ['R4C4', 5],
  ['R6C6', 9], ['R6C7', 2],
  ['R7C5', 8], ['R7C8', 3],
  ['R8C5', 7], ['R8C8', 4],
  ['R9C6', 6], ['R9C7', 5],
];
// Grey palindrome lines, from `lines[].wayPoints` interpolated to cells.
const palindromes = [
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5'],
  ['R7C2', 'R6C3'],
  ['R3C6', 'R2C7', 'R1C8'],
  ['R1C5', 'R2C6', 'R3C7', 'R4C8'],
];
return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...palindromes.map(cells => new Palindrome(...cells)),
  new AntiKnight(),
];
