// Title: Twin Palindrome Killer
// Author: James Peter
// Video: https://www.youtube.com/watch?v=WJnCC26RZXY
// Source: https://app.crackingthecryptic.com/sudoku/JmHPnTDLDH

// Normal sudoku (standard 3x3 boxes). Twelve killer cages sum to their
// printed totals. Two lines, in different colours, are each a palindrome
// (reads the same from either end). No given digits.

return [
  new Shape('9x9'),

  // Cages: two-cell killer cages, each cell already sharing a row/column
  // house with its partner.
  new Cage(6, 'R1C4', 'R2C4'),
  new Cage(15, 'R1C6', 'R2C6'),
  new Cage(14, 'R3C3', 'R4C3'),
  new Cage(11, 'R3C6', 'R3C7'),
  new Cage(7, 'R4C1', 'R4C2'),
  new Cage(8, 'R4C8', 'R4C9'),
  new Cage(13, 'R6C8', 'R6C9'),
  new Cage(11, 'R6C7', 'R7C7'),
  new Cage(8, 'R6C1', 'R6C2'),
  new Cage(3, 'R7C3', 'R7C4'),
  new Cage(14, 'R8C4', 'R9C4'),
  new Cage(6, 'R8C6', 'R9C6'),

  // Palindrome lines, one per colour (yellowgreen, chocolate); the two
  // lines cross at a few cells but share no drawn edge, so they are two
  // independent palindromes.
  new Palindrome('R3C2', 'R2C3', 'R1C4', 'R2C5', 'R3C6', 'R4C7', 'R5C8',
                  'R6C9', 'R7C8', 'R8C7', 'R9C6', 'R8C5', 'R7C4', 'R6C3',
                  'R5C2', 'R4C1'),
  new Palindrome('R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1', 'R7C2',
                  'R8C3', 'R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9',
                  'R3C8', 'R2C7'),
];
