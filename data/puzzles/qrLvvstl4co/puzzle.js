// Title: Heterochromia
// Author: Emmett Nelson
// Video: https://www.youtube.com/watch?v=qrLvvstl4co
// Source: https://app.crackingthecryptic.com/sudoku/rJjtrfrJdr

// Normal sudoku rules apply. Cages sum to the small clue printed in their
// top-left corner and forbid repeats within the cage. No givens.

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array (10 real
  // entries; the payload's 11th entry has no cells and no total, so it is a
  // metadata stub, not a cage).
  new Cage(23, 'R2C1', 'R3C1', 'R4C1', 'R4C2'),
  new Cage(14, 'R1C2', 'R1C3', 'R1C4', 'R2C4'),
  new Cage(14, 'R1C6', 'R1C7', 'R1C8', 'R2C8'),
  new Cage(27, 'R2C5', 'R3C5', 'R4C5', 'R4C6'),
  new Cage(12, 'R2C6', 'R2C7', 'R3C7'),
  new Cage(14, 'R4C8', 'R5C8', 'R5C7', 'R5C6'),
  new Cage(14, 'R5C2', 'R5C3', 'R5C4', 'R6C4'),
  new Cage(22, 'R6C1', 'R7C1', 'R8C1', 'R8C2'),
  new Cage(19, 'R6C2', 'R7C2', 'R7C3'),
  new Cage(26, 'R6C5', 'R7C5', 'R8C5', 'R8C4'),
];
