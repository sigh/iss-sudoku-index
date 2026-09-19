// Title: The New York Times "Hard" Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=JoFXZ727N_k

// Rules: no rules panel is visible on screen. Plain classic sudoku: digits
// 1-9 in every row, column and 3x3 box; Shape('9x9') supplies all three
// groups.

// Givens: the 25 digits visible in an early frame of the video, taken before
// the presenter has entered any candidate note or solved digit (the cursor
// sits on a blank cell with nothing yet placed). Cross-checked against a
// later frame: every given here still reads the same value there, and the
// only change between the two frames is the cursor position and one
// candidate note (not a solved cell), confirming no digit was added in the
// interim.
return [
  new Shape('9x9'),

  new Given('R1C1', 8),
  new Given('R1C5', 5),
  new Given('R1C6', 3),
  new Given('R1C9', 6),
  new Given('R2C4', 6),
  new Given('R2C6', 8),
  new Given('R2C8', 2),
  new Given('R3C2', 6),
  new Given('R4C2', 7),
  new Given('R4C3', 9),
  new Given('R4C7', 4),
  new Given('R5C3', 3),
  new Given('R5C6', 7),
  new Given('R5C7', 1),
  new Given('R5C9', 5),
  new Given('R6C1', 4),
  new Given('R6C3', 1),
  new Given('R6C8', 3),
  new Given('R8C5', 7),
  new Given('R8C6', 5),
  new Given('R9C1', 5),
  new Given('R9C3', 7),
  new Given('R9C4', 9),
  new Given('R9C5', 4),
  new Given('R9C9', 1),
];
