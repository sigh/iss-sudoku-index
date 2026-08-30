// Title: StarCraft Sudoku
// Author: Alice
// Video: https://www.youtube.com/watch?v=h4tpMbROJJY
// Source: https://cracking-the-cryptic.web.app/sudoku/3MB4bh3GMH

// Standard 9x9 sudoku (default rows/cols/boxes). A caption printed in a lane
// below the grid, read left to right, spells the puzzle's only rule:
// "Z = 1,2,3; T = 4,5,6; P = 7,8,9." -- cells shaded purple/yellow-green/
// sky-blue (labelled Z/T/P) are restricted to the matching digit band. Each
// restriction below is encoded as a multi-value Given (candidate restriction,
// per iss-constraints catalog "Givens And Variables").

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C1', 8),
  new Given('R1C7', 2),
  new Given('R2C5', 7),
  new Given('R3C2', 3),
  new Given('R3C4', 5),
  new Given('R3C8', 6),
  new Given('R4C2', 4),
  new Given('R4C4', 1),
  new Given('R4C9', 2),
  new Given('R5C3', 8),
  new Given('R5C9', 9),
  new Given('R7C8', 5),
  new Given('R8C6', 1),
  new Given('R9C3', 4),
  new Given('R9C4', 9),
  new Given('R9C9', 7),

  // Z cells (purple): restricted to 1, 2 or 3.
  new Given('R2C6', 1, 2, 3),
  new Given('R6C1', 1, 2, 3),
  new Given('R7C2', 1, 2, 3),
  new Given('R8C9', 1, 2, 3),

  // T cells (yellow-green): restricted to 4, 5 or 6.
  new Given('R1C3', 4, 5, 6),
  new Given('R4C6', 4, 5, 6),
  new Given('R5C2', 4, 5, 6),
  new Given('R5C5', 4, 5, 6),
  new Given('R6C8', 4, 5, 6),
  new Given('R7C6', 4, 5, 6),

  // P cells (sky-blue): restricted to 7, 8 or 9.
  new Given('R1C8', 7, 8, 9),
  new Given('R5C6', 7, 8, 9),
  new Given('R7C1', 7, 8, 9),
];
