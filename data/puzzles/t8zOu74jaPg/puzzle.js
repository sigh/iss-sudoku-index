// Title: The New York Times "Hard" Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=t8zOu74jaPg

// Rules: no rules panel is visible on screen. Plain classic sudoku: digits
// 1-9 in every row, column and 3x3 box; Shape('9x9') supplies all three
// groups.

// Givens: the 26 digits visible in an early frame of the video, taken before
// the presenter has placed any digit (the one editable cell is empty and
// selected). Cross-checked against a later mid-solve frame: every given here
// still reads the same value there, and the mid-solve frame's three
// additional filled cells (all value 4, the digit the presenter completes
// first) are absent from the early frame, confirming they are solved cells,
// not givens.
return [
  new Shape('9x9'),

  new Given('R1C4', 9),
  new Given('R1C6', 4),
  new Given('R1C7', 1),
  new Given('R1C9', 5),
  new Given('R2C1', 3),
  new Given('R3C2', 4),
  new Given('R3C4', 8),
  new Given('R3C6', 5),
  new Given('R3C8', 9),
  new Given('R3C9', 3),
  new Given('R4C4', 1),
  new Given('R4C7', 4),
  new Given('R5C3', 4),
  new Given('R5C5', 2),
  new Given('R5C7', 8),
  new Given('R6C3', 2),
  new Given('R6C5', 4),
  new Given('R6C6', 9),
  new Given('R7C3', 6),
  new Given('R7C8', 1),
  new Given('R8C2', 8),
  new Given('R8C4', 7),
  new Given('R8C5', 9),
  new Given('R8C6', 1),
  new Given('R8C9', 4),
  new Given('R9C1', 7),
];
