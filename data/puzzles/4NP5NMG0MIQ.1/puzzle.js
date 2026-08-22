// Title: Crossover1
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=4NP5NMG0MIQ
// Source: https://app.crackingthecryptic.com/sudoku/6Qq6GD2H2h

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 28
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 1),
  new Given('R1C7', 4),
  new Given('R2C4', 1),
  new Given('R2C6', 4),
  new Given('R2C9', 8),
  new Given('R3C1', 3),
  new Given('R3C4', 2),
  new Given('R3C6', 5),
  new Given('R3C9', 6),
  new Given('R4C2', 3),
  new Given('R4C3', 2),
  new Given('R4C6', 8),
  new Given('R4C7', 5),
  new Given('R4C8', 6),
  new Given('R6C2', 4),
  new Given('R6C3', 6),
  new Given('R6C4', 7),
  new Given('R6C7', 3),
  new Given('R6C8', 1),
  new Given('R7C1', 4),
  new Given('R7C4', 6),
  new Given('R7C6', 3),
  new Given('R7C9', 1),
  new Given('R8C1', 7),
  new Given('R8C4', 5),
  new Given('R8C6', 2),
  new Given('R9C3', 5),
  new Given('R9C7', 2),
];
