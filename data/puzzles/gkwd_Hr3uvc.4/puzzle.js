// Title: Feb. 28, 2023: No Leaping!
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=gkwd_Hr3uvc
// Source: https://tinyurl.com/bp5hervx

// Rules: "Normal sudoku rules apply. And that's it!" Standard 9x9 grid, rows,
// columns and 3x3 boxes each contain 1-9 once. No other clue geometry
// (cages, lines, arrows, regions) is present in the payload.

return [
  new Shape('9x9'),

  // Givens transcribed from the puzzle's clue grid.
  new Given('R1C1', 7), new Given('R1C9', 4),
  new Given('R2C3', 1), new Given('R2C4', 2), new Given('R2C5', 3), new Given('R2C6', 4),
  new Given('R3C2', 5), new Given('R3C5', 6),
  new Given('R4C2', 6), new Given('R4C4', 4), new Given('R4C8', 2),
  new Given('R5C2', 7), new Given('R5C3', 2), new Given('R5C7', 9), new Given('R5C8', 4),
  new Given('R6C2', 8), new Given('R6C6', 5), new Given('R6C8', 6),
  new Given('R7C5', 1), new Given('R7C8', 8),
  new Given('R8C4', 7), new Given('R8C5', 5), new Given('R8C6', 3), new Given('R8C7', 1),
  new Given('R9C1', 3), new Given('R9C9', 6),
];
