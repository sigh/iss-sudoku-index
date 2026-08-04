// Title: January 14, 2023: El Clasico
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=DnRGUWffGsc
// Source: https://tinyurl.com/bd698rww

// Classic 9x9 sudoku. Rules: "Normal sudoku rules apply. And that's it!"
// Givens transcribed from the puzzle's drawn grid (row-major, given cells only).

return [
  new Shape('9x9'),
  new Given('R1C4', 2), new Given('R1C6', 1),
  new Given('R2C3', 3), new Given('R2C7', 2),
  new Given('R3C2', 4), new Given('R3C5', 6), new Given('R3C8', 3),
  new Given('R4C1', 5), new Given('R4C4', 3), new Given('R4C6', 7), new Given('R4C9', 4),
  new Given('R5C3', 2), new Given('R5C7', 8),
  new Given('R6C1', 6), new Given('R6C4', 1), new Given('R6C6', 9), new Given('R6C9', 5),
  new Given('R7C2', 7), new Given('R7C5', 4), new Given('R7C8', 6),
  new Given('R8C3', 8), new Given('R8C7', 7),
  new Given('R9C4', 9), new Given('R9C6', 8),
];
