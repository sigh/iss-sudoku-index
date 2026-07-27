// Title: Din's Pearl
// Author: Wei-Hwa Huang
// Video: https://www.youtube.com/watch?v=gFzgB9jY5cM
// Source: https://tinyurl.com/DinsPearl

// Normal sudoku rules apply: standard 9x9 grid, default row/column/box
// all-different constraints (from Shape/default regions), plus the 27
// given digits below. No cages, lines, arrows, or other geometry are
// present in the source payload.
//
// Givens transcribed from the source's per-cell grid values.
return [
  new Shape('9x9'),
  new Given('R1C2', 2),
  new Given('R1C3', 3),
  new Given('R1C7', 9),
  new Given('R2C1', 1),
  new Given('R2C4', 4),
  new Given('R2C5', 5),
  new Given('R2C8', 8),
  new Given('R3C6', 6),
  new Given('R3C7', 7),
  new Given('R4C2', 4),
  new Given('R4C3', 5),
  new Given('R5C1', 6),
  new Given('R5C4', 7),
  new Given('R5C5', 9),
  new Given('R5C6', 8),
  new Given('R5C9', 1),
  new Given('R6C7', 3),
  new Given('R6C8', 2),
  new Given('R7C3', 8),
  new Given('R7C4', 2),
  new Given('R8C2', 9),
  new Given('R8C5', 1),
  new Given('R8C6', 3),
  new Given('R8C9', 5),
  new Given('R9C3', 7),
  new Given('R9C7', 4),
  new Given('R9C8', 6),
];
