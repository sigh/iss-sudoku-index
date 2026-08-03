// Title: Free Yourself
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=ceho1f3FBwA
// Source: https://tinyurl.com/4fyptfcm

// Normal sudoku rules apply (rows, columns, boxes all-different; no givens).
// Rule 2: digits in a cage are distinct and sum to the printed corner total
// -- Cage(sum, ...cells) encodes both parts directly.
// Rule 3: each grey line's digits read the same forwards and backwards --
// Palindrome(...cells) is exactly that pairwise-equality constraint.
// Cage and palindrome-line cells are transcribed from the drawn cage and
// grey-line geometry.

const cages = [
  new Cage(11, 'R3C2', 'R4C2'),
  new Cage(4, 'R1C6', 'R1C7'),
  new Cage(17, 'R9C3', 'R9C4'),
  new Cage(9, 'R6C8', 'R7C8'),
  new Cage(10, 'R1C4', 'R1C5'),
  new Cage(8, 'R8C4', 'R8C5'),
  new Cage(11, 'R6C7', 'R7C7'),
  new Cage(8, 'R3C3', 'R4C3'),
  new Cage(12, 'R2C5', 'R2C6'),
  new Cage(8, 'R9C5', 'R9C6'),
  new Cage(14, 'R1C8', 'R1C9'),
  new Cage(9, 'R9C1', 'R9C2'),
  new Cage(11, 'R4C4', 'R5C4'),
  new Cage(3, 'R5C6', 'R6C6'),
];

const palindromes = [
  new Palindrome('R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C2', 'R3C2', 'R4C2', 'R5C2'),
  new Palindrome('R2C6', 'R2C5', 'R2C4', 'R3C3', 'R4C3', 'R5C3'),
  new Palindrome('R8C4', 'R8C5', 'R8C6', 'R7C7', 'R6C7', 'R5C7'),
  new Palindrome('R6C3', 'R5C4', 'R4C4', 'R3C5', 'R3C6'),
  new Palindrome('R4C7', 'R5C6', 'R6C6', 'R7C5', 'R7C4'),
  new Palindrome('R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...palindromes,
];
