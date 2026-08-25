// Title: Infinity Sudoku
// Author: Jason Olson
// Video: https://www.youtube.com/watch?v=nHVbN7R2QC8
// Source: https://app.crackingthecryptic.com/6fN6GPG4MF

// Normal sudoku rules apply, standard 3x3 boxes (Shape default). No other
// clues are present; every given below is transcribed from the source cells.

return [
  new Shape('9x9'),
  new Given('R1C6', 8),
  new Given('R1C7', 6),
  new Given('R1C8', 1),
  new Given('R2C2', 1),
  new Given('R2C5', 3),
  new Given('R2C9', 7),
  new Given('R3C5', 7),
  new Given('R3C9', 9),
  new Given('R4C5', 8),
  new Given('R4C9', 4),
  new Given('R5C2', 9),
  new Given('R5C3', 6),
  new Given('R5C4', 1),
  new Given('R5C5', 4),
  new Given('R5C6', 7),
  new Given('R5C7', 3),
  new Given('R5C8', 5),
  new Given('R6C1', 5),
  new Given('R6C5', 6),
  new Given('R7C1', 6),
  new Given('R7C5', 1),
  new Given('R8C1', 9),
  new Given('R8C5', 2),
  new Given('R8C8', 7),
  new Given('R9C2', 8),
  new Given('R9C3', 3),
  new Given('R9C4', 4),
];
