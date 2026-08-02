// Title: Classic Sudoku
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=kxQ8kZVi7l4
// Source: https://tinyurl.com/5hmaa9u8

// Standard 9x9 Sudoku with the source's 24 givens.
return [
  new Shape('9x9'),
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R1C4', 3), new Given('R1C5', 4),
  new Given('R2C3', 7), new Given('R2C4', 1), new Given('R2C9', 5),
  new Given('R3C8', 1), new Given('R3C9', 6),
  new Given('R4C8', 9), new Given('R4C9', 7),
  new Given('R5C1', 9), new Given('R5C9', 8),
  new Given('R6C1', 7), new Given('R6C2', 2),
  new Given('R7C1', 6), new Given('R7C2', 5),
  new Given('R8C1', 8), new Given('R8C6', 9), new Given('R8C7', 3),
  new Given('R9C5', 3), new Given('R9C6', 1), new Given('R9C7', 8), new Given('R9C8', 6),
];
