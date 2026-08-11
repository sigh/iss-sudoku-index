// Title: Stretch Marks
// Author: Qodec
// Video: https://www.youtube.com/watch?v=Y9wBC3H4iH4
// Source: https://app.crackingthecryptic.com/sudoku/b86fhmTD8r

// Normal sudoku, standard 3x3 boxes. Six givens. Pink lines: each holds a set
// of consecutive, non-repeating digits, in any order -- Renban. Grey lines:
// palindromes, i.e. the same digit at both ends -- Palindrome (each grey line
// here has exactly two cells, so this is a plain equality).

const renbans = [
  ['R1C4', 'R2C3', 'R3C2', 'R4C1'],
  ['R3C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R7C9', 'R8C8', 'R7C7', 'R6C6'],
  ['R7C4', 'R6C5', 'R5C6', 'R4C7'],
  ['R3C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R1C7', 'R2C7', 'R2C8'],
  ['R7C1', 'R8C2'],
  ['R6C1', 'R5C2'],
  ['R9C3', 'R8C4', 'R8C5', 'R7C5'],
];

const palindromes = [
  ['R3C7', 'R4C6'],
  ['R6C4', 'R7C3'],
];

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R1C9', 9),
  new Given('R5C1', 9),
  new Given('R5C9', 1),
  new Given('R9C1', 1),
  new Given('R9C5', 9),
  ...renbans.map((cells) => new Renban(...cells)),
  ...palindromes.map((cells) => new Palindrome(...cells)),
];
