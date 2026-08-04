// Title: Pile of 20
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=qHxbjarO_eU
// Source: https://app.crackingthecryptic.com/sudoku/MGGnprtGJn

// Normal sudoku (rows, columns, 3x3 boxes) plus seven killer cages, each 4
// cells summing to 20 with no repeated digit inside the cage. The drawn
// regions are the standard 3x3 boxes, so the default box constraint applies
// and no explicit Region/NoBoxes is needed. No lines, arrows, or other
// geometry are present.

return [
  new Shape('9x9'),

  new Given('R1C3', 2),
  new Given('R1C4', 5),
  new Given('R1C5', 6),
  new Given('R3C1', 3),
  new Given('R3C9', 2),
  new Given('R5C7', 3),
  new Given('R5C8', 8),
  new Given('R6C9', 9),
  new Given('R7C7', 7),
  new Given('R8C9', 6),
  new Given('R9C2', 2),
  new Given('R9C3', 5),
  new Given('R9C4', 6),

  // Cages: cells transcribed from the drawn cage geometry; every cage's
  // stated total is 20.
  new Cage(20, 'R2C2', 'R2C3', 'R2C4', 'R3C3'),
  new Cage(20, 'R2C5', 'R3C5', 'R3C4', 'R4C4'),
  new Cage(20, 'R3C2', 'R4C2', 'R5C2', 'R6C2'),
  new Cage(20, 'R4C3', 'R5C3', 'R6C3', 'R7C3'),
  new Cage(20, 'R4C5', 'R5C5', 'R5C4', 'R6C5'),
  new Cage(20, 'R6C4', 'R7C4', 'R7C5', 'R8C5'),
  new Cage(20, 'R7C2', 'R8C2', 'R8C3', 'R8C4'),
];
