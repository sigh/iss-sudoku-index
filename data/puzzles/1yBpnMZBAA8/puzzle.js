// Title: Asterisk
// Author: Clover
// Video: https://www.youtube.com/watch?v=1yBpnMZBAA8
// Source: https://app.crackingthecryptic.com/webapp/jJMjF89dnr

// Normal sudoku rules apply (standard 3x3 boxes; no variant regions drawn).
// Each main diagonal contains all digits 1-9 (both diagonals are drawn).
// Digits in a cage may not repeat and must sum to the indicated total.
// Digits along a thick grey line form a palindrome.

return [
  new Shape('9x9'),

  new Given('R3C3', 2),
  new Given('R5C5', 1),
  new Given('R7C7', 3),

  new Diagonal(-1),
  new Diagonal(1),

  // Cages (killer: sum + all-different within each cage).
  new Cage(18, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(18, 'R1C5', 'R1C6', 'R2C6'),
  new Cage(13, 'R1C7', 'R2C7'),
  new Cage(12, 'R8C5', 'R9C5'),
  new Cage(13, 'R8C3', 'R9C3'),
  new Cage(18, 'R8C8', 'R9C8', 'R9C9', 'R8C9'),
  new Cage(9, 'R5C9', 'R6C9'),

  // Palindrome lines (drawn thick grey, each an 8-cell open path with no
  // repeated cell): the digit sequence along each line reads the same
  // forwards and backwards.
  new Palindrome(
    'R3C4', 'R4C5', 'R3C6', 'R4C7', 'R5C6', 'R5C7', 'R6C7', 'R6C6'),
  new Palindrome(
    'R7C6', 'R6C5', 'R7C4', 'R6C3', 'R5C4', 'R5C3', 'R4C3', 'R4C4'),
];
