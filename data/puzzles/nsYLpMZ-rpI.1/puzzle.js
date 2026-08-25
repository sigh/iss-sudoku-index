// Title: Classic Sudoku
// Author: 2016 Times Sudoku Championship
// Video: https://www.youtube.com/watch?v=nsYLpMZ-rpI
// Source: https://app.crackingthecryptic.com/hjNnTbH8BL

// Classic Sudoku: default row, column, and 3x3 box all-different rules.
// The source payload has no additional clues or geometry.
return [
  new Shape('9x9'),
  new Given('R2C3', 8), new Given('R2C4', 5), new Given('R2C6', 7), new Given('R2C8', 9),
  new Given('R3C2', 1), new Given('R3C6', 6), new Given('R3C8', 3), new Given('R3C9', 2),
  new Given('R4C2', 4), new Given('R4C7', 2),
  new Given('R5C5', 2), new Given('R5C9', 8),
  new Given('R6C2', 2), new Given('R6C3', 3), new Given('R6C6', 8), new Given('R6C7', 9), new Given('R6C8', 7),
  new Given('R7C4', 4), new Given('R7C6', 1),
  new Given('R8C2', 7), new Given('R8C3', 1), new Given('R8C6', 9), new Given('R8C9', 5),
  new Given('R9C3', 4), new Given('R9C5', 5), new Given('R9C8', 1),
];
