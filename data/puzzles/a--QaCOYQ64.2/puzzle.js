// Title: Big Feelings
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=a--QaCOYQ64
// Source: https://tinyurl.com/2s4eezvu

// Rules: "Normal sudoku rules apply." Standard row, column and box
// all-different constraints, provided by ISS's default 9x9 Shape, are the
// entire ruleset. No cages, lines, arrows, regions or other geometry are
// present in the payload.

// Givens transcribed from the source grid's cells.
return [
  new Shape('9x9'),
  new Given('R1C5', 3),
  new Given('R1C7', 4),
  new Given('R2C4', 8),
  new Given('R2C6', 5),
  new Given('R3C1', 3),
  new Given('R3C3', 6),
  new Given('R3C5', 2),
  new Given('R3C7', 7),
  new Given('R4C2', 8),
  new Given('R4C4', 1),
  new Given('R4C6', 2),
  new Given('R4C8', 5),
  new Given('R5C1', 2),
  new Given('R5C3', 1),
  new Given('R5C7', 3),
  new Given('R5C9', 4),
  new Given('R6C2', 7),
  new Given('R6C4', 4),
  new Given('R6C6', 3),
  new Given('R6C8', 6),
  new Given('R7C3', 5),
  new Given('R7C5', 4),
  new Given('R7C7', 8),
  new Given('R7C9', 2),
  new Given('R8C4', 7),
  new Given('R8C6', 6),
  new Given('R9C3', 4),
  new Given('R9C5', 1),
];
