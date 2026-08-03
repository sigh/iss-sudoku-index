// Title: Something Doesn't Add Up
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=FIYy4lFPzvY
// Source: https://app.crackingthecryptic.com/sudoku/gbp9G4tdJM

// Normal sudoku rules apply (standard rows/columns/boxes from Shape('9x9')).
// Digits within a cage sum to the small clue in its top-left cell, when
// given, and cannot repeat within a cage -- Cage(sum, ...cells). The last
// cage below has no printed total, so it enforces only the no-repeat part
// (sum 0 means "any sum", per Cage's semantics).
const cages = [
  new Cage(8, 'R5C2', 'R5C3'),
  new Cage(7, 'R2C2', 'R2C3'),
  new Cage(7, 'R1C6', 'R2C6'),
  new Cage(7, 'R3C4', 'R3C5'),
  new Cage(16, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(16, 'R3C1', 'R3C2', 'R4C1'),
  new Cage(8, 'R4C4', 'R4C5'),
  new Cage(8, 'R5C6', 'R6C6'),
  new Cage(17, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(21, 'R7C6', 'R7C7', 'R8C7', 'R9C6', 'R9C7'),
  new Cage(0, 'R6C4', 'R6C5', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C4', 'R8C5'),
];

return [
  new Shape('9x9'),
  new Given('R2C9', 9),
  new Given('R4C3', 6),
  new Given('R5C8', 9),
  new Given('R7C9', 3),
  new Given('R9C1', 5),
  ...cages,
];
