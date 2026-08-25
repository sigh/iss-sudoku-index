// Title: Monte
// Author: shye
// Video: https://www.youtube.com/watch?v=6QtqVIwKLjI
// Source: https://app.crackingthecryptic.com/sudoku/nJHjpdmj98

// Plain classic sudoku: normal sudoku rules apply, standard nine 3x3 box
// regions (default), and no other clues. Row, column, and box all-different
// come from the default Shape('9x9').
return [
  new Shape('9x9'),
  new Given('R1C1', 6),
  new Given('R1C3', 4),
  new Given('R1C4', 3),
  new Given('R1C6', 5),
  new Given('R1C7', 2),
  new Given('R1C9', 1),
  new Given('R3C2', 1),
  new Given('R3C3', 5),
  new Given('R3C7', 7),
  new Given('R3C8', 6),
  new Given('R4C4', 4),
  new Given('R4C6', 3),
  new Given('R4C9', 2),
  new Given('R5C3', 2),
  new Given('R5C5', 5),
  new Given('R5C7', 1),
  new Given('R6C1', 7),
  new Given('R6C4', 2),
  new Given('R6C6', 1),
  new Given('R7C2', 2),
  new Given('R7C3', 6),
  new Given('R7C7', 8),
  new Given('R7C8', 1),
  new Given('R9C1', 5),
  new Given('R9C3', 3),
  new Given('R9C4', 1),
  new Given('R9C6', 2),
  new Given('R9C7', 6),
  new Given('R9C9', 4),
];
