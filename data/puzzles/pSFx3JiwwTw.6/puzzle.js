// Title: Oct. 9, 2021: B1G3 Palindrome
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=pSFx3JiwwTw
// Source: https://tinyurl.com/85n3paay

// Normal sudoku rules on the 6x6 grid (default 2x3 boxes). Digits along a
// grey line must form a palindrome (read the same from either direction).
// Palindrome cell order does not matter -- the rule is symmetric.

return [
  new Shape('6x6'),
  new Given('R1C1', 1),
  new Given('R1C6', 3),
  new Given('R2C1', 5),
  new Given('R2C3', 3),
  new Given('R3C6', 2),
  new Given('R6C1', 2),
  new Given('R6C6', 4),
  new Palindrome('R1C3', 'R1C4', 'R2C4'),
  new Palindrome('R2C2', 'R2C3', 'R3C3'),
  new Palindrome('R4C3', 'R4C2', 'R5C2'),
  new Palindrome('R5C3', 'R6C3', 'R6C4'),
  new Palindrome('R4C5', 'R4C6', 'R5C6'),
];
