// Title: The Merry-Go-Round
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=3KaGJPM-N1I
// Source: https://app.crackingthecryptic.com/sudoku/jf6RnbgLFm

// Rules encoded: normal sudoku (default row/column/box all-different), both
// marked diagonals, distinct killer cages, grey palindrome strokes, and the
// single white consecutive-dot pair.

// Cage cells and totals transcribed from the outlined cages.
const cageTable = [
  [23, 'R1C4', 'R1C5', 'R1C6'],
  [21, 'R4C9', 'R5C9', 'R6C9'],
  [24, 'R4C1', 'R5C1', 'R6C1'],
  [22, 'R9C4', 'R9C5', 'R9C6'],
  [7, 'R5C3', 'R6C3'],
  [6, 'R3C4', 'R3C5'],
  [7, 'R4C7', 'R5C7'],
  [8, 'R7C5', 'R7C6'],
];
const cages = cageTable.map(([sum, ...cells]) => new Cage(sum, ...cells));

// Grey strokes transcribed in their drawn order; each is a separate palindrome.
const palindromeLines = [
  ['R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R5C1', 'R6C1', 'R7C2', 'R8C3', 'R9C4'],
  ['R9C5', 'R9C6', 'R8C7', 'R7C8', 'R6C9'],
  ['R5C9', 'R4C9', 'R3C8', 'R2C7', 'R1C6'],
  ['R3C4', 'R4C3', 'R5C3'],
  ['R6C3', 'R7C4', 'R7C5'],
  ['R7C6', 'R6C7', 'R5C7'],
  ['R4C7', 'R3C6', 'R3C5'],
];
const palindromes = palindromeLines.map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...cages,
  ...palindromes,
  new WhiteDot('R5C8', 'R6C8'),
];
