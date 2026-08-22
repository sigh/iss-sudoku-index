// Title: Spokes
// Author: krangune
// Video: https://www.youtube.com/watch?v=GXyH9V2mHWo
// Source: https://app.crackingthecryptic.com/sudoku/7BgqG63BR9

// Normal sudoku rules apply (default Shape rows/cols/boxes all-different).
// Cages: digits sum to the total shown in the cage's top-left cell, and
// digits within a cage do not repeat (Cage enforces both).
// Grey lines: digits along the line form a palindrome (Palindrome).

return [
  new Shape('9x9'),

  // Cages, top-left-to-bottom-right cell order; totals from the drawn cages.
  new Cage(14, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(15, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(15, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(14, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(22, 'R4C5', 'R5C4', 'R5C5', 'R5C6', 'R6C5'),
  new Cage(19, 'R5C1', 'R6C1', 'R6C2'),
  new Cage(15, 'R4C8', 'R4C9', 'R5C9'),
  new Cage(13, 'R1C4', 'R1C5', 'R2C4'),
  new Cage(18, 'R8C6', 'R9C5', 'R9C6'),

  // Grey palindrome lines, cell order as drawn (direction is immaterial to
  // the palindrome constraint).
  new Palindrome('R3C1', 'R4C1', 'R5C2'),
  new Palindrome('R2C1', 'R3C2', 'R4C2'),
  new Palindrome('R1C3', 'R2C3', 'R3C3', 'R3C4', 'R3C5'),
  new Palindrome('R2C5', 'R1C6', 'R1C7'),
  new Palindrome('R2C7', 'R3C6', 'R4C6'),
  new Palindrome('R3C9', 'R3C8', 'R3C7', 'R4C7', 'R5C7'),
  new Palindrome('R5C8', 'R6C9', 'R7C9'),
  new Palindrome('R5C6', 'R6C7', 'R6C8'),
  new Palindrome('R6C4', 'R7C4', 'R8C3'),
  new Palindrome('R8C5', 'R9C4', 'R9C3'),
  new Palindrome('R7C5', 'R7C6', 'R7C7', 'R8C7', 'R9C7'),
  new Palindrome('R7C1', 'R7C2', 'R7C3', 'R6C3', 'R5C3'),
];
