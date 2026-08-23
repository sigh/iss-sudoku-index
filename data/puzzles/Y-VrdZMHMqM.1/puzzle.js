// Title: August 15, 2021: Did Set Join?
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=Y-VrdZMHMqM
// Source: https://tinyurl.com/8j376kjv

// Normal sudoku rules apply (Shape + default row/column/box constraints).
// Additional rule: digits cannot appear in the same relative position in
// different boxes. `DisjointSets` is exactly this rule: "No digit may appear
// in the same position in any two boxes."
// Givens transcribed from the puzzle's stored grid.

return [
  new Shape('9x9'),

  new DisjointSets(),

  new Given('R1C3', 4), new Given('R1C4', 2), new Given('R1C6', 6), new Given('R1C7', 3),
  new Given('R2C2', 3), new Given('R2C5', 5), new Given('R2C8', 7),
  new Given('R3C1', 2), new Given('R3C4', 4), new Given('R3C6', 9), new Given('R3C9', 6),
  new Given('R4C1', 4), new Given('R4C3', 7), new Given('R4C7', 6), new Given('R4C9', 9),
  new Given('R5C2', 1), new Given('R5C8', 2),
  new Given('R6C1', 6), new Given('R6C3', 2), new Given('R6C7', 5), new Given('R6C9', 1),
  new Given('R7C1', 7), new Given('R7C4', 8), new Given('R7C6', 3), new Given('R7C9', 5),
  new Given('R8C2', 4), new Given('R8C5', 6), new Given('R8C8', 8),
  new Given('R9C3', 3), new Given('R9C4', 9), new Given('R9C6', 5), new Given('R9C7', 7),
];
