// Title: Too Difficult For The World Sudoku Championship
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=9D52vymi_v8
// Source: https://cracking-the-cryptic.web.app/sudoku/4bHGdhtT9F
//
// Normal sudoku rules apply: rows, columns and boxes each hold 1-9 once.
// No other rule, clue, or overlay is drawn anywhere in the payload.

return [
  new Shape('9x9'),

  new Given('R1C4', 4),
  new Given('R1C9', 2),
  new Given('R2C3', 3),
  new Given('R2C5', 5),
  new Given('R2C7', 4),
  new Given('R3C2', 2),
  new Given('R3C4', 6),
  new Given('R3C8', 9),
  new Given('R4C1', 1),
  new Given('R4C3', 7),
  new Given('R5C2', 8),
  new Given('R5C8', 2),
  new Given('R6C7', 9),
  new Given('R6C9', 5),
  new Given('R7C2', 3),
  new Given('R7C6', 8),
  new Given('R7C8', 1),
  new Given('R8C3', 2),
  new Given('R8C5', 1),
  new Given('R8C7', 5),
  new Given('R9C1', 4),
  new Given('R9C6', 3),
];
