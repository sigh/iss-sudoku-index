// Title: 8/16/22: Panama Mama Nap
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=VGVN2oFFXnM
// Source: https://tinyurl.com/2h7p3xdt

// Normal sudoku rules apply. Digits along a grey line must form a palindrome
// (read the same from either direction): Palindrome enforces exactly this.
// Line cells transcribed from the payload's `palindrome` array (7 lines).

const palindromes = [
  ['R3C6', 'R3C5', 'R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3', 'R7C3',
   'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7'],
  ['R3C2', 'R4C1'],
  ['R8C7', 'R9C6'],
  ['R7C8', 'R6C9'],
  ['R2C3', 'R1C4'],
  ['R6C1', 'R7C2'],
  ['R8C3', 'R9C4'],
].map(cells => new Palindrome(...cells));

return [
  new Shape('9x9'),

  new Given('R1C6', 6), new Given('R1C7', 1),
  new Given('R2C6', 4), new Given('R2C7', 2),
  new Given('R3C7', 3), new Given('R3C8', 4), new Given('R3C9', 5),
  new Given('R4C6', 7), new Given('R4C8', 1), new Given('R4C9', 6),
  new Given('R5C2', 8), new Given('R5C5', 6),
  new Given('R6C4', 9),
  new Given('R8C5', 7),

  ...palindromes,
];
