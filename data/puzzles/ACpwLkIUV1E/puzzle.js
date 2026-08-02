// Title: Next in Line
// Author: Tyler Chen
// Video: https://www.youtube.com/watch?v=ACpwLkIUV1E
// Source: https://app.crackingthecryptic.com/pq9nLF4mfJ

// Normal Sudoku rules apply; the givens are transcribed from the grid.
return [
  new Shape('9x9'),
  new Given('R1C2', 3), new Given('R1C3', 2), new Given('R1C4', 8), new Given('R1C8', 9), new Given('R1C9', 7),
  new Given('R2C5', 3), new Given('R2C9', 6),
  new Given('R3C1', 9), new Given('R3C2', 8), new Given('R3C5', 2), new Given('R3C7', 1),
  new Given('R4C2', 5), new Given('R4C6', 3), new Given('R4C7', 9), new Given('R4C9', 8),
  new Given('R5C2', 2),
  new Given('R6C3', 9), new Given('R6C4', 1), new Given('R6C5', 4),
  new Given('R7C6', 5), new Given('R7C9', 9),
  new Given('R8C4', 3), new Given('R8C5', 1), new Given('R8C9', 5),
  new Given('R9C1', 7), new Given('R9C4', 4), new Given('R9C6', 6), new Given('R9C7', 3),
];
