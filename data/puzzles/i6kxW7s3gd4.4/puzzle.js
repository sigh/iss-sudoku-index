// Title: May 19, 2023: Palindrome
// Author: clover!
// Video: https://www.youtube.com/watch?v=i6kxW7s3gd4
// Source: https://tinyurl.com/2p87yhad

// Normal sudoku rules apply. The digits along each gray line form a
// palindrome (reads the same in both directions) -- one Palindrome
// constraint per drawn line, in the drawn cell order.

const givens = [
  new Given('R1C5', 1),
  new Given('R2C2', 6),
  new Given('R2C6', 4),
  new Given('R2C8', 1),
  new Given('R3C4', 9),
  new Given('R4C2', 8),
  new Given('R4C5', 2),
  new Given('R5C1', 6),
  new Given('R5C4', 7),
  new Given('R5C5', 3),
  new Given('R5C6', 8),
  new Given('R5C9', 9),
  new Given('R6C5', 4),
  new Given('R6C8', 6),
  new Given('R7C6', 7),
  new Given('R8C2', 9),
  new Given('R8C4', 1),
  new Given('R8C8', 4),
  new Given('R9C5', 5),
];

// Cell paths from the `palindrome` array, source order.
const palindromes = [
  new Palindrome('R4C4', 'R3C3', 'R2C4', 'R3C5'),
  new Palindrome('R4C6', 'R3C7', 'R4C8', 'R5C7'),
  new Palindrome('R6C6', 'R7C7', 'R8C6', 'R7C5'),
  new Palindrome('R6C4', 'R7C3', 'R6C2', 'R5C3'),
  new Palindrome('R4C3', 'R3C2', 'R2C3', 'R1C4', 'R2C5'),
  new Palindrome('R3C6', 'R2C7', 'R3C8', 'R4C9', 'R5C8'),
  new Palindrome('R8C5', 'R9C6', 'R8C7', 'R7C8', 'R6C7'),
  new Palindrome('R7C4', 'R8C3', 'R7C2', 'R6C1', 'R5C2'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...palindromes,
];
