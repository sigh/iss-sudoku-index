// Title: Mar 29 2022: Palindrome Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Lh_j9DLhIY4
// Source: https://tinyurl.com/3zrs2h6h

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box) -- standard
// box regions via Shape('9x9'). Grey lines must form a palindromic sequence
// (read the same both directions) -> Palindrome, cells in drawn order (source
// `palindrome[].lines` arrays). No other clue types (cages, arrows, overlays)
// appear in the payload.

const palindromeA = ['R3C2', 'R3C3', 'R4C4', 'R4C5'];
const palindromeB = ['R6C5', 'R6C6', 'R7C7', 'R7C8'];
const palindromeC = ['R1C5', 'R1C6', 'R2C7', 'R2C8'];
const palindromeD = ['R9C5', 'R9C4', 'R8C3', 'R8C2'];

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C2', 2),
  new Given('R2C2', 3),
  new Given('R2C3', 4),
  new Given('R3C8', 4),
  new Given('R3C9', 5),
  new Given('R4C9', 6),
  new Given('R5C3', 1),
  new Given('R5C5', 9),
  new Given('R5C7', 5),
  new Given('R6C1', 2),
  new Given('R7C1', 3),
  new Given('R7C2', 4),
  new Given('R8C7', 6),
  new Given('R8C8', 7),
  new Given('R9C8', 8),
  new Given('R9C9', 9),

  new Palindrome(...palindromeA),
  new Palindrome(...palindromeB),
  new Palindrome(...palindromeC),
  new Palindrome(...palindromeD),
];
