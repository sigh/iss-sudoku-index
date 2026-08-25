// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=3nTbrue58ts
// Source: https://sudokupad.app/d3MqnbrJqQ

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (cages, lines,
// arrows) appear in the payload; the puzzle is fully determined by its 28
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C3', 9),
  new Given('R1C4', 2),
  new Given('R1C5', 1),
  new Given('R1C6', 4),
  new Given('R1C7', 3),
  new Given('R2C2', 8),
  new Given('R2C8', 9),
  new Given('R3C4', 9),
  new Given('R3C9', 1),
  new Given('R4C1', 6),
  new Given('R4C5', 2),
  new Given('R4C6', 3),
  new Given('R4C9', 4),
  new Given('R5C2', 2),
  new Given('R5C8', 3),
  new Given('R6C1', 8),
  new Given('R6C4', 1),
  new Given('R6C5', 7),
  new Given('R6C9', 6),
  new Given('R7C1', 4),
  new Given('R7C6', 1),
  new Given('R8C2', 1),
  new Given('R8C8', 5),
  new Given('R9C3', 5),
  new Given('R9C4', 4),
  new Given('R9C5', 6),
  new Given('R9C6', 7),
  new Given('R9C7', 8),
];
