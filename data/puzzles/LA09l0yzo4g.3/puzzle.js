// Title: Oct 17, 2021: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=LA09l0yzo4g
// Source: https://app.crackingthecryptic.com/sudoku/3gqfH234Nr

// Normal sudoku rules apply, and that's it. Row/column/box all-different are
// the engine's automatic baseline, so this script is only the shape and the
// given digits.
return [
  new Shape('9x9'),
  new Given('R1C4', 6),
  new Given('R1C5', 3),
  new Given('R2C4', 7),
  new Given('R2C5', 5),
  new Given('R3C1', 5),
  new Given('R3C2', 7),
  new Given('R3C7', 1),
  new Given('R3C8', 2),
  new Given('R4C1', 4),
  new Given('R4C2', 3),
  new Given('R4C7', 5),
  new Given('R4C8', 1),
  new Given('R6C2', 5),
  new Given('R6C3', 8),
  new Given('R6C8', 6),
  new Given('R6C9', 9),
  new Given('R7C2', 8),
  new Given('R7C3', 9),
  new Given('R7C8', 3),
  new Given('R7C9', 7),
  new Given('R8C5', 7),
  new Given('R8C6', 3),
  new Given('R9C5', 1),
  new Given('R9C6', 4),
];
