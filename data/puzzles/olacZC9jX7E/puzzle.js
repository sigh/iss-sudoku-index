// Title: Sudoku X
// Author: Aad Van De Wetering
// Video: https://www.youtube.com/watch?v=olacZC9jX7E
// Source: https://cracking-the-cryptic.web.app/sudoku/GHfGq7p8hM

// Standard Sudoku (rows, columns, 3x3 boxes) plus both main diagonals as
// all-different groups. The payload carries no rules text or title/author
// metadata; both are taken from the video description, which names this
// puzzle "Aad Van De Wetering's extraordinary Sudoku X" and links this same
// source URL. Both diagonals are drawn corner-to-corner as thick lines
// (payload `lines`), the standard Sudoku X marker.
return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),

  new Given('R1C3', 3), new Given('R1C5', 1), new Given('R1C6', 4),
  new Given('R2C3', 2), new Given('R2C7', 1), new Given('R2C8', 5),
  new Given('R3C2', 6), new Given('R3C9', 9),
  new Given('R4C1', 4), new Given('R4C9', 2),
  new Given('R5C1', 8), new Given('R5C9', 6),
  new Given('R6C1', 3), new Given('R6C9', 5),
  new Given('R7C1', 2), new Given('R7C8', 3),
  new Given('R8C2', 3), new Given('R8C5', 9), new Given('R8C6', 8), new Given('R8C7', 5),
  new Given('R9C3', 9), new Given('R9C4', 7),
];
