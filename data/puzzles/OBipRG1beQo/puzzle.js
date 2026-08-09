// Title: Smile
// Author: shye
// Video: https://www.youtube.com/watch?v=OBipRG1beQo
// Source: https://app.crackingthecryptic.com/sudoku/Gf27HN77p2

// Classic 9x9 sudoku. Normal sudoku rules apply (default row/column/box
// all-different from Shape). No additional constraints.

return [
  new Shape('9x9'),

  new Given('R1C3', 6),
  new Given('R1C7', 4),
  new Given('R2C2', 1),
  new Given('R2C8', 5),
  new Given('R3C1', 2),
  new Given('R3C4', 6),
  new Given('R3C6', 5),
  new Given('R3C9', 1),
  new Given('R4C1', 4),
  new Given('R4C4', 5),
  new Given('R4C6', 7),
  new Given('R4C9', 3),
  new Given('R5C1', 9),
  new Given('R5C9', 2),
  new Given('R6C1', 3),
  new Given('R6C3', 1),
  new Given('R6C7', 5),
  new Given('R6C9', 9),
  new Given('R7C1', 6),
  new Given('R7C4', 2),
  new Given('R7C5', 3),
  new Given('R7C6', 4),
  new Given('R7C9', 5),
  new Given('R8C2', 3),
  new Given('R8C8', 6),
  new Given('R9C3', 5),
  new Given('R9C7', 3),
];
