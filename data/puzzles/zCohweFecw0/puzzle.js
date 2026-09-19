// Title: The New York Times "Hard" Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=zCohweFecw0

// Rules: no rules panel is visible on screen. Plain classic sudoku: digits
// 1-9 in every row, column and 3x3 box; Shape('9x9') supplies all three
// groups.

// Givens: the 25 digits visible in an early frame of the video, taken while
// every large digit on the board still reads in one consistent bold weight
// (no player-entered fill yet). Cross-checked against a later mid-solve
// frame: every given here still reads the same value there, and the
// mid-solve frame's five additional filled cells are absent from the early
// frame, confirming they are solved cells, not givens.
return [
  new Shape('9x9'),

  new Given('R1C1', 6),
  new Given('R1C5', 4),
  new Given('R2C1', 3),
  new Given('R2C3', 1),
  new Given('R2C5', 7),
  new Given('R2C8', 4),
  new Given('R3C3', 7),
  new Given('R3C4', 6),
  new Given('R3C8', 8),
  new Given('R4C1', 9),
  new Given('R4C2', 1),
  new Given('R4C3', 8),
  new Given('R4C5', 6),
  new Given('R5C5', 9),
  new Given('R5C7', 1),
  new Given('R5C8', 3),
  new Given('R6C6', 4),
  new Given('R6C8', 6),
  new Given('R7C1', 1),
  new Given('R7C4', 9),
  new Given('R8C1', 4),
  new Given('R8C5', 3),
  new Given('R9C2', 3),
  new Given('R9C3', 5),
  new Given('R9C8', 1),
];
