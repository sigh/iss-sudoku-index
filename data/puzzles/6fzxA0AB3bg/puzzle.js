// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=6fzxA0AB3bg
// Source: https://app.crackingthecryptic.com/qJt7JGpQTg

// Normal sudoku rules apply: digits 1-9 once per row, column and 3x3 box.
// The source draws the standard 3x3 box partition, which is the ISS default,
// so rows/columns/boxes need no explicit constraint. There is no other clue
// art in the source; the 23 Given cells below are transcribed from its drawn
// grid and are the whole of the puzzle.

return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Given('R1C5', 4),
  new Given('R2C2', 5),
  new Given('R2C5', 7),
  new Given('R2C6', 3),
  new Given('R2C7', 4),
  new Given('R3C3', 9),
  new Given('R3C9', 8),
  new Given('R4C3', 1),
  new Given('R4C8', 6),
  new Given('R5C3', 4),
  new Given('R5C5', 5),
  new Given('R5C7', 3),
  new Given('R6C2', 7),
  new Given('R6C7', 2),
  new Given('R7C1', 2),
  new Given('R7C7', 7),
  new Given('R8C3', 3),
  new Given('R8C4', 8),
  new Given('R8C5', 6),
  new Given('R8C8', 9),
  new Given('R9C5', 9),
  new Given('R9C9', 1),
];
