// Title: October 27, 2022: Methane
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=q9emJvhqMxk
// Source: https://tinyurl.com/2bf8z8w8

// Standard 9x9 Sudoku with the givens transcribed from the grid.
return [
  new Shape('9x9'),
  new Given('R1C3', 3), new Given('R1C4', 6), new Given('R1C8', 8),
  new Given('R2C3', 9), new Given('R2C4', 5), new Given('R2C6', 1), new Given('R2C8', 3),
  new Given('R3C4', 4), new Given('R3C6', 2), new Given('R3C7', 1),
  new Given('R4C2', 1), new Given('R4C3', 7), new Given('R4C7', 3), new Given('R4C8', 2), new Given('R4C9', 4),
  new Given('R6C1', 5), new Given('R6C2', 3), new Given('R6C3', 2), new Given('R6C7', 6), new Given('R6C8', 1),
  new Given('R7C3', 1), new Given('R7C4', 3), new Given('R7C6', 5),
  new Given('R8C2', 2), new Given('R8C4', 1), new Given('R8C6', 4), new Given('R8C7', 9),
  new Given('R9C2', 7), new Given('R9C6', 9), new Given('R9C7', 2),
];
