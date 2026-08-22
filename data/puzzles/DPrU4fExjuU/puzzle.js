// Title: !discord
// Author: ICHTUES & Florian Wortmann
// Video: https://www.youtube.com/watch?v=DPrU4fExjuU
// Source: https://app.crackingthecryptic.com/sudoku/H969Dr8nPH

// Normal sudoku rules apply. Cage digits sum to the small clue in the cage's
// top-left corner and cannot repeat within the cage. Digits along an arrow
// sum to the digit in that arrow's circle. Cells a knight's move apart
// cannot repeat (AntiKnight).
//
// Two arrows share the circle at R4C7, so both of their sums equal that one
// digit (drawn as two separate strokes from the same underlay circle).

return [
  new Given('R2C4', 2),
  new Given('R5C5', 8),

  new AntiKnight(),

  new Cage(17, 'R2C6', 'R2C7', 'R3C7', 'R4C7'),
  new Cage(8, 'R3C3', 'R3C2', 'R4C2'),
  new Cage(37, 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R8C7', 'R9C6', 'R9C5'),

  new Arrow('R4C7', 'R3C8', 'R3C9'),
  new Arrow('R4C7', 'R5C7', 'R5C8', 'R5C9'),
  new Arrow('R4C4', 'R5C3', 'R5C2'),
  new Arrow('R8C1', 'R7C2', 'R7C3'),
  new Arrow('R7C7', 'R7C8', 'R8C8'),
];
