// Title: Shot Thru the Heart
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lbgLAhRoBOA
// Source: https://app.crackingthecryptic.com/sudoku/TgrGnPpD79

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes). Digits do not repeat in cages, which show their sums: each
// Cage below is a 3-cell no-repeat sum cage. Grey lines are palindromes,
// reading the same each way: direction is irrelevant to a palindrome, so the
// two Palindrome lines below are given in the payload's drawn waypoint
// order.

// 15 killer cages, transcribed from the drawn cage clues (cells + sum).
const cages = [
  new Cage(15, 'R2C2', 'R3C2', 'R3C1'),
  new Cage(8, 'R2C3', 'R3C3', 'R3C4'),
  new Cage(9, 'R4C1', 'R5C1', 'R5C2'),
  new Cage(15, 'R4C2', 'R4C3', 'R5C3'),
  new Cage(20, 'R6C2', 'R6C3', 'R7C3'),
  new Cage(10, 'R6C4', 'R7C4', 'R7C5'),
  new Cage(22, 'R5C4', 'R4C4', 'R4C5'),
  new Cage(9, 'R8C4', 'R8C5', 'R9C5'),
  new Cage(19, 'R8C6', 'R7C6', 'R7C7'),
  new Cage(15, 'R6C5', 'R6C6', 'R6C7'),
  new Cage(11, 'R5C6', 'R4C6', 'R3C6'),
  new Cage(16, 'R3C7', 'R2C7', 'R2C8'),
  new Cage(22, 'R3C8', 'R3C9', 'R4C9'),
  new Cage(16, 'R4C8', 'R4C7', 'R5C7'),
  new Cage(17, 'R5C9', 'R5C8', 'R6C8'),
];

// 2 grey palindrome lines, transcribed from the drawn line paths.
const palindromes = [
  new Palindrome('R2C7', 'R3C6', 'R4C5'),
  new Palindrome(
    'R2C8', 'R3C9', 'R4C9', 'R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5',
    'R8C4', 'R7C3', 'R6C2', 'R5C1', 'R4C1', 'R3C1', 'R2C2', 'R2C3', 'R3C4'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...palindromes,
];
