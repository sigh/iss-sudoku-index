// Title: Anti-Knight Killer Sudoku #2
// Author: Akash Jain
// Video: https://www.youtube.com/watch?v=wZr6Lcikavk
// Source: https://app.crackingthecryptic.com/sudoku/2p67j99gmT

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top-left corner of the cage and cannot repeat within the cage. Cells a
// knight's move apart cannot hold the same digit. No given digits.
//
// Cage cell lists below are transcribed from the payload's `cages` array
// (row-major [row, col] pairs converted to R#C# ids).

return [
  new Shape('9x9'),

  new Cage(33, 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6'),
  new Cage(23, 'R3C3', 'R3C4', 'R3C5', 'R4C3', 'R4C4', 'R5C3'),
  new Cage(17, 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2'),
  new Cage(13, 'R7C2', 'R8C2', 'R8C3'),
  new Cage(33, 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6'),
  new Cage(10, 'R7C8', 'R8C7', 'R8C8'),
  new Cage(19, 'R4C8', 'R4C9', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(24, 'R2C7', 'R2C8', 'R3C8'),

  new AntiKnight(),
];
