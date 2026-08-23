// Title: Lattice
// Author: DVFrank
// Video: https://www.youtube.com/watch?v=OtMKyW2gCac
// Source: https://app.crackingthecryptic.com/sudoku/3mg6PRM6bF

// Normal sudoku rules (default row/column/box all-different). Twelve killer
// cages (sum to the printed total, no repeats within a cage). One outside
// clue gives the sum of the main diagonal R1C1..R9C9; digits on that
// diagonal may repeat, so it is modelled as a sum only (no AllDifferent).

return [
  new Shape('9x9'),

  new Given('R6C6', 1),

  new Cage(15, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(15, 'R1C4', 'R1C5', 'R2C4', 'R2C5'),
  new Cage(12, 'R1C7', 'R1C8', 'R2C7'),
  new Cage(12, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(13, 'R3C6', 'R3C7', 'R4C6'),
  new Cage(13, 'R6C3', 'R6C4', 'R7C3'),
  new Cage(15, 'R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Cage(20, 'R4C4', 'R4C5', 'R5C4', 'R5C5'),
  new Cage(15, 'R4C7', 'R4C8', 'R5C7', 'R5C8'),
  new Cage(13, 'R7C1', 'R7C2', 'R8C1'),
  new Cage(15, 'R7C4', 'R7C5', 'R8C4', 'R8C5'),
  new Cage(15, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),

  // Outside diagonal clue "37": sum of the full main diagonal R1C1-R9C9.
  // fromCells derives the canonical arrowId from the drawn cell ray rather
  // than assuming R1C1 is the on-grid corner ISS expects (per iss-constraints
  // catalog guidance for outside clues).
  LittleKiller.fromCells(37, cellGraph('9x9').ray('R1C1', 1, 1), cellGeometry('9x9')),
];
