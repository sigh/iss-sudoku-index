// Title: Tobiko
// Author: Pseudonum
// Video: https://www.youtube.com/watch?v=y8R1QGwi-9c
// Source: https://app.crackingthecryptic.com/sudoku/8qgqrTGT9D

// Normal sudoku rules apply. Cages sum to the small clue in the cage's
// top-left cell, digits within a cage do not repeat. Grey lines are
// palindromes. Digits cannot repeat along either main diagonal (both
// diagonals are drawn blue). Cells joined by an X sum to 10; not every
// such pair is marked, so unmarked pairs carry no constraint (no negative
// reading is encoded).

const cages = [
  new Cage(6, 'R4C2', 'R5C2', 'R6C2'),
  new Cage(7, 'R4C8', 'R5C8', 'R6C8'),
];

const palindromes = [
  new Palindrome('R2C2', 'R3C1', 'R4C1'),
  new Palindrome('R4C3', 'R4C4', 'R3C5'),
  new Palindrome('R3C6', 'R4C6', 'R5C7'),
  new Palindrome('R5C3', 'R6C4', 'R7C4'),
  new Palindrome('R7C5', 'R6C6', 'R6C7'),
  new Palindrome('R8C2', 'R9C3', 'R9C4'),
  new Palindrome('R1C6', 'R1C7', 'R2C8'),
  new Palindrome('R6C9', 'R7C9', 'R8C8'),
];

// X marks: sum to 10, drawn as edge overlays between the two cells.
const xPairs = [
  ['R4C2', 'R4C3'],
  ['R5C2', 'R5C3'],
  ['R6C2', 'R6C3'],
  ['R4C7', 'R4C8'],
  ['R5C7', 'R5C8'],
  ['R6C7', 'R6C8'],
  ['R7C4', 'R8C4'],
  ['R7C5', 'R8C5'],
  ['R2C5', 'R3C5'],
  ['R2C6', 'R3C6'],
];
const xSums = xPairs.map(([a, b]) => new Sum(10, a, b));

return [
  new Shape('9x9'),
  new Given('R1C3', 1),
  ...cages,
  ...palindromes,
  ...xSums,
  new Diagonal(1),
  new Diagonal(-1),
];
