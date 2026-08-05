// Title: 10/30/22: Mark-o'-lantern
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=esVk3NovHEE
// Source: https://tinyurl.com/mvthnenn

// Normal Sudoku rules apply. The coloured cell shading is not assigned a rule.
// Givens transcribed from the source grid.
return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C2', 2), new Given('R1C8', 3), new Given('R1C9', 4),
  new Given('R2C1', 3), new Given('R2C9', 5),
  new Given('R3C3', 4), new Given('R3C4', 5), new Given('R3C6', 1), new Given('R3C7', 2),
  new Given('R4C2', 6), new Given('R4C3', 7), new Given('R4C4', 8), new Given('R4C6', 3), new Given('R4C7', 4), new Given('R4C8', 5),
  new Given('R6C2', 4), new Given('R6C3', 1), new Given('R6C5', 2), new Given('R6C7', 7), new Given('R6C8', 6),
  new Given('R7C3', 8), new Given('R7C4', 7), new Given('R7C5', 6), new Given('R7C6', 9), new Given('R7C7', 5),
  new Given('R8C1', 5), new Given('R8C9', 7),
  new Given('R9C1', 6), new Given('R9C2', 7), new Given('R9C8', 8), new Given('R9C9', 9),
];
