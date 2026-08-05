// Title: (untitled)
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=FLATfYbBeug
// Source: https://tinyurl.com/4um2z62h

// Standard 9x9 Sudoku: digits 1-9 do not repeat in any row, column, or box.
// Givens transcribed from the displayed grid.
return [
  new Shape('9x9'),
  new Given('R1C1', 3), new Given('R1C2', 2), new Given('R1C3', 1),
  new Given('R1C7', 6), new Given('R1C8', 5), new Given('R1C9', 4),
  new Given('R2C1', 4), new Given('R2C9', 3),
  new Given('R3C1', 5), new Given('R3C9', 2),
  new Given('R4C3', 6), new Given('R4C4', 3), new Given('R4C6', 7),
  new Given('R4C7', 1),
  new Given('R5C3', 7), new Given('R5C5', 1), new Given('R5C7', 8),
  new Given('R6C5', 6),
  new Given('R7C2', 5), new Given('R7C5', 7), new Given('R7C8', 4),
  new Given('R8C2', 8), new Given('R8C4', 1), new Given('R8C5', 3),
  new Given('R8C6', 5), new Given('R8C8', 6),
  new Given('R9C5', 9),
];
