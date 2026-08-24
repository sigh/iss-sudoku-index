// Title: Anti-Knight Killer Sudoku #3
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=8h-TaTMHnw8
// Source: https://app.crackingthecryptic.com/sudoku/g9PGjPqH3p

// Normal sudoku rules apply (rows, columns, and boxes 1-9, default Shape('9x9')).
// Cells a knight's move apart cannot repeat a digit (AntiKnight).
// Each cage sums to its printed total and cannot repeat a digit (Cage).
// No given digits.

return [
  new Shape('9x9'),
  new AntiKnight(),

  // Cages: cells and totals as drawn on the board.
  new Cage(37, 'R1C3', 'R2C3', 'R3C3', 'R3C4', 'R2C4', 'R1C4'),
  new Cage(30, 'R4C3', 'R5C3', 'R6C3', 'R6C4', 'R5C4', 'R4C4'),
  new Cage(23, 'R7C3', 'R8C3', 'R9C3', 'R9C4', 'R8C4', 'R7C4'),
  new Cage(23, 'R1C6', 'R2C6', 'R3C6', 'R3C7', 'R2C7', 'R1C7'),
  new Cage(36, 'R4C6', 'R5C6', 'R6C6', 'R6C7', 'R5C7', 'R4C7'),
  new Cage(31, 'R7C6', 'R8C6', 'R9C6', 'R9C7', 'R8C7', 'R7C7'),
  new Cage(16, 'R2C1', 'R3C1', 'R3C2'),
  new Cage(14, 'R3C8', 'R3C9', 'R4C9'),
  new Cage(13, 'R6C1', 'R7C1', 'R7C2'),
  new Cage(19, 'R7C8', 'R7C9', 'R8C9'),
  new Cage(13, 'R6C5', 'R7C5'),
  new Cage(10, 'R3C5', 'R4C5'),
];
