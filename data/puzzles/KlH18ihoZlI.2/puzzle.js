// Title: Crow
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=KlH18ihoZlI
// Source: https://tinyurl.com/nhkksrtw

// Rules: "Normal Sudoku Rules Apply." The payload carries no cages, lines,
// arrows, or extra regions -- only the 23 givens below, so the default row,
// column and 3x3 box all-different groups are the whole ruleset.
return [
  new Shape('9x9'),
  new Given('R1C6', 1),
  new Given('R2C2', 6),
  new Given('R2C3', 4),
  new Given('R2C7', 2),
  new Given('R2C8', 8),
  new Given('R3C2', 8),
  new Given('R3C6', 3),
  new Given('R3C8', 1),
  new Given('R4C1', 9),
  new Given('R4C3', 7),
  new Given('R4C4', 4),
  new Given('R5C5', 1),
  new Given('R6C6', 6),
  new Given('R6C7', 3),
  new Given('R6C9', 5),
  new Given('R7C2', 2),
  new Given('R7C4', 5),
  new Given('R7C8', 4),
  new Given('R8C2', 4),
  new Given('R8C3', 6),
  new Given('R8C7', 8),
  new Given('R8C8', 2),
  new Given('R9C4', 7),
];
