// Title: Shuriken
// Author: Crispy16
// Video: https://www.youtube.com/watch?v=UIiLL39o7U8
// Source: https://app.crackingthecryptic.com/sudoku/GpfBbHBhPM

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). A purple line contains a set of non-repeating consecutive
// numbers in any order -> Renban. A grey or orange line is a palindrome,
// which reads the same from both ends -> Palindrome. Cell paths transcribed
// from the drawn strokes (colours: purple, grey, orange).

const renbans = [
  ['R2C1', 'R1C2'],
  ['R1C8', 'R2C9'],
  ['R8C9', 'R9C8'],
  ['R8C1', 'R9C2'],
  ['R5C1', 'R6C1', 'R7C2', 'R8C3', 'R8C4', 'R8C5', 'R8C6'],
  ['R9C5', 'R9C6', 'R8C7', 'R7C8', 'R6C8', 'R5C8', 'R4C8'],
  ['R5C9', 'R4C9', 'R3C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4'],
  ['R1C5', 'R1C4', 'R2C3', 'R3C2', 'R4C2', 'R5C2', 'R6C2'],
].map((cells) => new Renban(...cells));

const palindromes = [
  ['R4C8', 'R3C7'],
  ['R2C6', 'R3C5', 'R4C4', 'R4C3', 'R4C2'],
  ['R6C8', 'R6C7', 'R6C6', 'R7C5', 'R8C4'],
  ['R2C6', 'R3C6', 'R4C6', 'R5C7', 'R6C8'],
  ['R4C2', 'R5C3', 'R6C4', 'R7C4', 'R8C4'],
].map((cells) => new Palindrome(...cells));

return [
  new Shape('9x9'),
  new Given('R1C3', 6),
  new Given('R4C7', 8),
  new Given('R6C3', 2),
  new Given('R9C7', 4),
  ...renbans,
  ...palindromes,
];
