// Title: March 16, 2023: Palindrome
// Author: clover!
// Video: https://www.youtube.com/watch?v=RMQ3yI_pFqA
// Source: https://tinyurl.com/4m6k392b

// Normal sudoku rules apply. Each gray line's digits form a palindrome
// (mirror-symmetric about its centre) -- Palindrome enforces this directly.
// Line cell lists are transcribed from the payload's `palindrome` array.

const givens = [
  new Given('R1C2', 4), new Given('R1C5', 2),
  new Given('R2C4', 3), new Given('R2C9', 8),
  new Given('R3C5', 1),
  new Given('R4C2', 1), new Given('R4C8', 7),
  new Given('R5C1', 3), new Given('R5C9', 6),
  new Given('R6C2', 2), new Given('R6C8', 8),
  new Given('R7C5', 4),
  new Given('R8C1', 1), new Given('R8C6', 6),
  new Given('R9C5', 5), new Given('R9C8', 2),
];

const palindromes = [
  new Palindrome('R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8', 'R6C9'),
  new Palindrome('R5C1', 'R6C1', 'R7C2', 'R8C3', 'R9C3'),
  new Palindrome('R5C9', 'R4C9', 'R3C8', 'R2C7', 'R1C7'),
  new Palindrome('R9C6', 'R8C5', 'R7C4', 'R6C3', 'R5C2', 'R4C1'),
  new Palindrome('R8C7', 'R7C6', 'R6C5', 'R5C4', 'R4C3', 'R3C2', 'R2C2'),
  new Palindrome('R2C3', 'R3C4', 'R4C5', 'R5C6', 'R6C7', 'R7C8', 'R7C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...palindromes,
];
