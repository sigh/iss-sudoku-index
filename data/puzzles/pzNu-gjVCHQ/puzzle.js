// Title: Pile of 15s
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=pzNu-gjVCHQ
// Source: https://app.crackingthecryptic.com/sudoku/7DPJj287BP

// Normal Sudoku with the nine shown givens. Numbered cage outlines sum to
// their displayed clue with no repeated digit; the unnumbered outlined cage
// is all-different only.
return [
  new Shape('9x9'),
  new Given('R1C6', 1),
  new Given('R1C7', 7),
  new Given('R2C1', 4),
  new Given('R5C5', 1),
  new Given('R6C5', 7),
  new Given('R6C7', 3),
  new Given('R7C8', 4),
  new Given('R7C9', 1),
  new Given('R8C5', 4),

  // Cages transcribed from the twelve drawn cage entries.
  new Cage(15, 'R2C2', 'R3C2', 'R4C2'),
  new Cage(15, 'R2C3', 'R3C3', 'R2C4'),
  new Cage(15, 'R3C4', 'R4C4', 'R5C4'),
  new Cage(15, 'R4C3', 'R5C3', 'R6C3'),
  new Cage(15, 'R5C2', 'R6C2', 'R7C2'),
  new Cage(15, 'R8C2', 'R8C3', 'R8C4'),
  new Cage(15, 'R9C2', 'R9C3', 'R9C4'),
  new Cage(15, 'R6C4', 'R7C4', 'R7C3'),
  new AllDifferent('R7C6', 'R7C7', 'R6C7', 'R6C8'),
  new Cage(9, 'R5C8', 'R5C9'),
  new Cage(9, 'R8C8', 'R9C8'),
  new Cage(8, 'R2C5', 'R3C5'),
];
