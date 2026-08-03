// Title: Echolalia
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=lc30O50G_rY
// Source: https://tinyurl.com/dhux49y9

// Rules: "Normal Sudoku Rules Apply." The payload carries only givens; no
// lines, cages, arrows, or other geometry are present, so the row, column,
// and box all-different constraints ISS applies by default are the whole
// puzzle.

return [
  new Shape('9x9'),
  new Given('R1C2', 5),
  new Given('R1C3', 6),
  new Given('R1C4', 7),
  new Given('R1C5', 8),
  new Given('R1C9', 4),
  new Given('R2C1', 4),
  new Given('R2C6', 6),
  new Given('R3C1', 3),
  new Given('R3C7', 8),
  new Given('R4C1', 2),
  new Given('R4C3', 8),
  new Given('R4C5', 5),
  new Given('R5C1', 1),
  new Given('R5C9', 9),
  new Given('R6C5', 6),
  new Given('R6C7', 2),
  new Given('R6C9', 8),
  new Given('R7C3', 2),
  new Given('R7C9', 7),
  new Given('R8C4', 1),
  new Given('R8C9', 6),
  new Given('R9C1', 6),
  new Given('R9C5', 2),
  new Given('R9C6', 3),
  new Given('R9C7', 4),
  new Given('R9C8', 5),
];
