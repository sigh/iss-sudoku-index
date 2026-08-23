// Title: Steering Wheel
// Author: SudokuExplorer
// Video: https://www.youtube.com/watch?v=Ui1hrp7rovw
// Source: https://app.crackingthecryptic.com/sudoku/7gJb9G8fRt

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. No other clue types (lines, cages,
// arrows) appear in the payload; the puzzle is fully determined by its 20
// givens below.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),

  new Given('R1C4', 1),
  new Given('R1C6', 2),
  new Given('R2C2', 6),
  new Given('R2C8', 7),
  new Given('R3C3', 8),
  new Given('R3C7', 9),
  new Given('R4C1', 4),
  new Given('R4C9', 3),
  new Given('R5C2', 5),
  new Given('R5C6', 7),
  new Given('R6C1', 2),
  new Given('R6C5', 8),
  new Given('R6C9', 1),
  new Given('R7C3', 9),
  new Given('R7C7', 8),
  new Given('R7C9', 5),
  new Given('R8C2', 7),
  new Given('R8C8', 6),
  new Given('R9C4', 3),
  new Given('R9C6', 4),
];
