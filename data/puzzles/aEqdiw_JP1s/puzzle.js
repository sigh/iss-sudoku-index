// Title: Fourteen
// Author: FryTheGuy
// Video: https://www.youtube.com/watch?v=aEqdiw_JP1s
// Source: https://app.crackingthecryptic.com/sudoku/rQb8nLLN3F

// Normal sudoku rules apply. In cages, digits must sum to the small clue in
// the top left corner of the cage; digits cannot repeat within a cage.
// Every cage in this puzzle totals 14. No givens and no other geometry are
// drawn.

return [
  new Shape('9x9'),
  new Cage(14, 'R1C3', 'R2C3', 'R3C3', 'R3C4'),
  new Cage(14, 'R2C4', 'R2C5', 'R3C5'),
  new Cage(14, 'R2C6', 'R3C6', 'R4C6'),
  new Cage(14, 'R3C7', 'R4C7', 'R4C8', 'R5C8'),
  new Cage(14, 'R4C4', 'R4C5', 'R5C5', 'R5C6'),
  new Cage(14, 'R3C1', 'R3C2', 'R4C2', 'R4C3'),
  new Cage(14, 'R5C2', 'R6C2', 'R6C3', 'R7C3'),
  new Cage(14, 'R8C2', 'R9C1', 'R9C2', 'R9C3'),
  new Cage(14, 'R8C5', 'R9C5', 'R9C6', 'R8C6'),
  new Cage(14, 'R7C6', 'R7C7', 'R8C7', 'R9C7'),
  new Cage(14, 'R6C7', 'R6C8', 'R7C8', 'R7C9'),
];
