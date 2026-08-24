// Title: Only 6
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Q4cEP-yYTLg
// Source: https://app.crackingthecryptic.com/sudoku/8fr3JL4prP

// Normal sudoku rules apply (standard 3x3 boxes, from the payload's own
// region partition, so no explicit Region constraints are needed).
// Global: cells a knight's move apart cannot repeat a digit (AntiKnight).
// Four killer cages: digits sum to the printed total and cannot repeat
// within the cage (Cage). Cage cell lists and totals below are transcribed
// from the drawn cage geometry (one additional entry in the source's cage
// list has no cells and is a metadata stub, not a real cage).

return [
  new Shape('9x9'),

  new Given('R2C7', 5),
  new Given('R5C7', 4),
  new Given('R6C3', 2),
  new Given('R7C5', 1),
  new Given('R7C7', 3),
  new Given('R9C7', 2),

  new AntiKnight(),

  new Cage(24, 'R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Cage(25, 'R4C3', 'R4C4', 'R5C3', 'R5C4'),
  new Cage(15, 'R6C5', 'R6C6', 'R7C5', 'R7C6'),
  new Cage(16, 'R8C5', 'R8C6', 'R9C5', 'R9C6'),
];
