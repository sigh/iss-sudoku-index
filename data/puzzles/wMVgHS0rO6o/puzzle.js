// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wMVgHS0rO6o
// Source: https://app.crackingthecryptic.com/6gNrFMdqF7

// Normal sudoku rules apply. Standard 3x3 box regions -- Shape('9x9')
// supplies rows/columns/boxes, matching the 9 whole-box regions in the
// payload. No other clue types (lines, cages, arrows) appear in the payload;
// the puzzle is fully determined by its 23 givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C5', 4),
  new Given('R1C6', 3),
  new Given('R2C2', 1),
  new Given('R2C3', 2),
  new Given('R2C7', 6),
  new Given('R2C8', 5),
  new Given('R3C1', 9),
  new Given('R4C3', 5),
  new Given('R4C4', 3),
  new Given('R4C6', 4),
  new Given('R4C9', 7),
  new Given('R5C2', 8),
  new Given('R6C1', 1),
  new Given('R6C4', 6),
  new Given('R6C7', 4),
  new Given('R6C8', 9),
  new Given('R7C5', 2),
  new Given('R7C7', 3),
  new Given('R7C8', 1),
  new Given('R8C5', 1),
  new Given('R8C8', 6),
  new Given('R9C6', 5),
  new Given('R9C7', 9),
];
