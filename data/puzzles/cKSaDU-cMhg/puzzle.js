// Title: Central Tendency
// Author: PixelPlucker
// Video: https://www.youtube.com/watch?v=cKSaDU-cMhg
// Source: https://app.crackingthecryptic.com/sudoku/gNJB4r6GBq

// Normal sudoku rules (rows, columns, boxes). Killer cages: digits in a cage
// do not repeat, and where a small total is shown in the cage's top-left
// cell, the cage's digits sum to it. One cage (R6C1,R6C2,R5C2,R6C3,R7C3) has
// no shown total, so it is encoded as all-different only. Several grid cells
// are not covered by any cage and carry no cage constraint.

return [
  new Shape('9x9'),
  new Given('R5C5', 5),

  new Cage(10, 'R1C1', 'R1C2'),
  new Cage(9, 'R1C8', 'R1C9'),
  new Cage(12, 'R1C5', 'R2C5'),
  new Cage(29, 'R1C4', 'R1C3', 'R2C3', 'R2C2', 'R3C2', 'R2C1'),
  new Cage(29, 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R2C9', 'R3C8'),
  new Cage(17, 'R3C4', 'R3C5', 'R3C6'),
  new Cage(10, 'R3C3', 'R4C3'),
  new Cage(8, 'R3C7', 'R4C7'),
  new Cage(14, 'R6C4', 'R6C5', 'R6C6'),
  new Cage(16, 'R4C8', 'R4C9', 'R5C9'),
  new Cage(25, 'R5C8', 'R6C8', 'R6C7', 'R6C9', 'R7C7'),
  new Cage(15, 'R7C8', 'R7C9', 'R8C9'),
  new Cage(17, 'R8C7', 'R9C7', 'R9C8'),
  new Cage(23, 'R7C4', 'R7C5', 'R7C6', 'R8C5', 'R9C5'),
  new Cage(13, 'R8C3', 'R9C3', 'R9C2'),
  new Cage(18, 'R7C2', 'R7C1', 'R8C1'),
  // No total shown in the source for this cage; all-different only.
  new AllDifferent('R6C1', 'R6C2', 'R5C2', 'R6C3', 'R7C3'),
  new Cage(17, 'R4C1', 'R5C1', 'R4C2'),
];
