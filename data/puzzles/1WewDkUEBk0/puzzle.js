// Title: Wisdom
// Author: clover and Memeristor
// Video: https://www.youtube.com/watch?v=1WewDkUEBk0
// Source: https://app.crackingthecryptic.com/sudoku/LfGHTrpjtb

// Normal sudoku rules apply (rows, columns and 3x3 boxes all-different --
// the default for Shape('9x9')). Digits cannot repeat along a main diagonal
// (marked in blue). In cages, digits must sum to the small clue in the top
// left corner of the cage (if given); digits cannot repeat within a cage.
//
// Two diagonals are drawn in the same blue with the same thickness (R1C1..R9C9
// and R9C1..R1C9); the rules sentence's singular "a main diagonal" is generic
// phrasing for the constraint type, and both drawn diagonals get the no-repeat
// rule since nothing distinguishes them.
//
// Two cages (R3C2,R4C2,R4C3,R5C3,R5C4 and R5C6,R5C7,R6C7,R6C8,R7C8) show no
// total: they still forbid repeats, encoded as AllDifferent per the catalog's
// "a killer cage with no total is simply AllDifferent(...cells)".

return [
  new Shape('9x9'),

  new Diagonal(-1), // top-left to bottom-right: R1C1..R9C9
  new Diagonal(1),  // bottom-left to top-right: R9C1..R1C9

  new Cage(18, 'R1C3', 'R2C3', 'R3C3', 'R2C2'),
  new Cage(12, 'R1C7', 'R2C7', 'R3C7', 'R2C8'),
  new Cage(12, 'R7C7', 'R8C7', 'R9C7', 'R8C8'),
  new Cage(12, 'R7C3', 'R8C3', 'R9C3', 'R8C2'),
  new AllDifferent('R3C2', 'R4C2', 'R4C3', 'R5C3', 'R5C4'),
  new Cage(12, 'R6C3', 'R6C4'),
  new Cage(12, 'R4C6', 'R4C7'),
  new AllDifferent('R5C6', 'R5C7', 'R6C7', 'R6C8', 'R7C8'),
  new Cage(6, 'R7C5', 'R8C5'),
  new Cage(14, 'R3C5', 'R4C5'),
  new Cage(11, 'R2C4', 'R2C5', 'R2C6'),
];
