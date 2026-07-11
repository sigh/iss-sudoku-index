// Title: Willkommen im Palindrom
// Author: billybeth
// Video: https://www.youtube.com/watch?v=1gnv6iM2sew
// Source: https://sudokupad.app/j99cp5qm7t

// Normal sudoku rules apply.
// The green line is a "German palindrome": consecutive digits on the line
// differ by at least 5, and the digits read the same in both directions.
// The grey cell (R9C9) must be larger than each cell orthogonally touching it.

const LINE = [
  'R7C8', 'R6C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5', 'R8C4', 'R9C3', 'R8C2',
  'R7C3', 'R7C2', 'R6C1', 'R5C1', 'R5C2', 'R6C3', 'R5C3', 'R4C4', 'R3C5',
  'R3C6', 'R2C6', 'R2C7', 'R3C8', 'R3C9', 'R4C9', 'R5C8', 'R6C7', 'R6C6',
  'R5C6', 'R5C5', 'R5C4', 'R4C3', 'R3C2', 'R2C3',
];

return [
  new Shape('9x9'),
  new Whisper(5, ...LINE),
  new Palindrome(...LINE),
  new GreaterThan('R9C9', 'R8C9'),
  new GreaterThan('R9C9', 'R9C8'),
];
