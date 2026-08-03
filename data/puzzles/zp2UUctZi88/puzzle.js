// Title: Chain Reaction
// Author: Kyle Vandeveer
// Video: https://www.youtube.com/watch?v=zp2UUctZi88
// Source: https://app.crackingthecryptic.com/sudoku/qNjLQHn9L6

// Normal sudoku rules apply: standard row, column, and 3x3 box all-different
// constraints, provided by the default Shape('9x9'), plus the givens below.
// There are no cages, lines, or other overlays in this puzzle.

// Givens transcribed from the puzzle's grid.
return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C9', 1),

  new Given('R2C4', 2),
  new Given('R2C5', 5),
  new Given('R2C7', 4),

  new Given('R3C3', 3),
  new Given('R3C8', 2),

  new Given('R4C2', 3),
  new Given('R4C6', 7),

  new Given('R5C3', 4),
  new Given('R5C4', 1),
  new Given('R5C5', 8),
  new Given('R5C8', 5),

  new Given('R6C1', 2),
  new Given('R6C6', 5),
  new Given('R6C8', 9),

  new Given('R7C5', 3),

  new Given('R8C2', 2),
  new Given('R8C7', 1),
  new Given('R8C9', 7),

  new Given('R9C1', 4),
  new Given('R9C3', 5),
  new Given('R9C4', 7),
  new Given('R9C6', 8),
  new Given('R9C9', 9),
];
