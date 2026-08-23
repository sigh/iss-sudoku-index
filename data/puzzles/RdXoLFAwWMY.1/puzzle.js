// Title: Sep 14, 2021: Palindrome
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=RdXoLFAwWMY
// Source: https://tinyurl.com/yjecn3hs

// Normal sudoku rules (rows, columns, boxes all-different) plus four grey
// palindrome lines: digits on each line must read the same forwards and
// backwards. Line cells are taken directly from the payload's `lines` array;
// waypoint order does not affect a palindrome, which is symmetric under
// reversal.

return [
  new Shape('9x9'),

  new Given('R1C6', 1),
  new Given('R1C7', 2),
  new Given('R1C8', 3),
  new Given('R1C9', 4),
  new Given('R3C1', 4),
  new Given('R4C2', 3),
  new Given('R5C1', 5),
  new Given('R5C5', 4),
  new Given('R5C9', 8),
  new Given('R6C8', 7),
  new Given('R7C9', 6),
  new Given('R9C1', 3),
  new Given('R9C2', 4),
  new Given('R9C3', 5),
  new Given('R9C4', 6),

  new Palindrome('R1C1', 'R1C2', 'R1C3', 'R2C4', 'R3C4', 'R4C4'),
  new Palindrome('R6C6', 'R7C6', 'R8C6', 'R9C7', 'R9C8', 'R9C9'),
  new Palindrome('R5C6', 'R4C6', 'R3C7', 'R3C8'),
  new Palindrome('R5C4', 'R6C4', 'R7C3', 'R7C2'),
];
