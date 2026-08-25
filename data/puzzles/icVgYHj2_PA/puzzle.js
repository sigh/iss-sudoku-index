// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=icVgYHj2_PA
// Source: https://sudokupad.app/N2qRrPLM3b

// Normal sudoku rules apply. Standard 3x3 box regions, no other clues.

return [
  new Shape('9x9'),

  new Given('R1C2', 2),
  new Given('R1C4', 1),
  new Given('R1C5', 8),
  new Given('R1C8', 3),
  new Given('R2C4', 3),
  new Given('R2C6', 6),
  new Given('R3C3', 6),
  new Given('R3C6', 4),
  new Given('R4C4', 5),
  new Given('R4C7', 4),
  new Given('R4C8', 1),
  new Given('R5C1', 1),
  new Given('R5C3', 5),
  new Given('R5C7', 2),
  new Given('R5C9', 8),
  new Given('R6C2', 9),
  new Given('R6C3', 4),
  new Given('R6C6', 2),
  new Given('R7C4', 2),
  new Given('R7C7', 7),
  new Given('R8C4', 8),
  new Given('R8C6', 5),
  new Given('R9C2', 6),
  new Given('R9C5', 3),
  new Given('R9C6', 1),
  new Given('R9C8', 2),
];
