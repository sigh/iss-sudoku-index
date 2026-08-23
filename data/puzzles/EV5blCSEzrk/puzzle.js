// Title: Ten Knights
// Author: FryTheGuy
// Video: https://www.youtube.com/watch?v=EV5blCSEzrk
// Source: https://app.crackingthecryptic.com/sudoku/D4mmRBrG4G

// Normal sudoku rules apply (rows, columns, and boxes 1-9, default Shape('9x9')).
// Cells a chess knight's move apart cannot repeat a digit (AntiKnight).
// Each cage sums to its printed total and cannot repeat a digit (Cage).
// No given digits.

return [
  new Shape('9x9'),
  new AntiKnight(),

  // Cages: cells and totals as drawn (all 9 cages sum to 10).
  new Cage(10, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(10, 'R2C3', 'R3C3', 'R3C4'),
  new Cage(10, 'R3C1', 'R3C2', 'R4C2'),
  new Cage(10, 'R4C3', 'R5C3', 'R5C4'),
  new Cage(10, 'R6C2', 'R6C3', 'R7C3'),
  new Cage(10, 'R5C5', 'R5C6'),
  new Cage(10, 'R6C6', 'R7C6', 'R8C6'),
  new Cage(10, 'R5C7', 'R4C7'),
  new Cage(10, 'R2C7', 'R2C8', 'R2C9'),
];
