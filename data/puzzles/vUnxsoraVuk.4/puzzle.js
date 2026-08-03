// Title: July 18, 2023: 20 is Right Out
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=vUnxsoraVuk
// Source: https://tinyurl.com/5bbh63xu

// Rules: "Normal sudoku rules apply. And that's it!" Standard row, column and
// box all-different constraints, provided by ISS's default 9x9 Shape, are the
// entire ruleset. No cages, lines, arrows, or other geometry are present.

// Givens transcribed from the source grid's cells.
return [
  new Shape('9x9'),
  new Given('R1C1', 1),
  new Given('R1C4', 8),
  new Given('R1C8', 6),
  new Given('R2C1', 2),
  new Given('R2C4', 7),
  new Given('R3C2', 3),
  new Given('R3C7', 2),
  new Given('R4C3', 4),
  new Given('R4C7', 6),
  new Given('R5C4', 5),
  new Given('R5C6', 4),
  new Given('R6C3', 6),
  new Given('R6C7', 3),
  new Given('R7C3', 7),
  new Given('R7C8', 8),
  new Given('R8C6', 5),
  new Given('R8C9', 7),
  new Given('R9C2', 6),
  new Given('R9C6', 2),
  new Given('R9C9', 5),
];
