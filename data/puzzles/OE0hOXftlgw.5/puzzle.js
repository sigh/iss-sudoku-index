// Title: August 21, 2023: Classic
// Author: clover!
// Video: https://www.youtube.com/watch?v=OE0hOXftlgw
// Source: https://tinyurl.com/mtx9s5sv

// Normal sudoku rules apply. And that's it! No cages, lines, or other
// geometry: rows, columns, and 3x3 boxes all-different plus the givens
// below are the entire ruleset.

return [
  new Shape('9x9'),

  // Givens transcribed from the puzzle's grid (row-major).
  new Given('R1C3', 7), new Given('R1C4', 8), new Given('R1C5', 6),
  new Given('R2C3', 6),
  new Given('R3C1', 3), new Given('R3C2', 4), new Given('R3C3', 5), new Given('R3C7', 1),
  new Given('R4C1', 2), new Given('R4C6', 3),
  new Given('R5C1', 1), new Given('R5C9', 2),
  new Given('R6C4', 4), new Given('R6C9', 3),
  new Given('R7C3', 8), new Given('R7C7', 6), new Given('R7C8', 5), new Given('R7C9', 4),
  new Given('R8C7', 7),
  new Given('R9C5', 5), new Given('R9C6', 9), new Given('R9C7', 8),
];
