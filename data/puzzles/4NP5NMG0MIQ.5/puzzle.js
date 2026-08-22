// Title: December 29, 2021: Whirlwind
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=4NP5NMG0MIQ
// Source: https://tinyurl.com/mtsrp89y

// Normal sudoku rules apply. And that's it! No cages, lines, or other
// geometry: rows, columns, and 3x3 boxes all-different plus the givens
// below are the entire ruleset.

return [
  new Shape('9x9'),

  // Givens transcribed from the puzzle's grid (row-major).
  new Given('R1C3', 2),
  new Given('R2C2', 7), new Given('R2C4', 2), new Given('R2C6', 1), new Given('R2C8', 6),
  new Given('R3C3', 6), new Given('R3C7', 7), new Given('R3C9', 3),
  new Given('R4C2', 1), new Given('R4C4', 8), new Given('R4C6', 9), new Given('R4C8', 3),
  new Given('R6C2', 5), new Given('R6C4', 7), new Given('R6C6', 6), new Given('R6C8', 1),
  new Given('R7C1', 5), new Given('R7C3', 9), new Given('R7C7', 8),
  new Given('R8C2', 8), new Given('R8C4', 1), new Given('R8C6', 4), new Given('R8C8', 9),
  new Given('R9C7', 4),
];
