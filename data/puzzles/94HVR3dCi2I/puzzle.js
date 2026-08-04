// Title: Peering Into The Fog
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=94HVR3dCi2I
// Source: https://app.crackingthecryptic.com/sudoku/DRMqF6t8td

// Normal sudoku (rows/columns/3x3 boxes all-different) plus:
// - Both diagonals: no repeated digit. The rules name "a main diagonal
//   (marked in blue)" singular, but both drawn lines share that exact blue
//   colour and thickness, so both are encoded.
// - Nine cages: digits sum to the given total and do not repeat within
//   the cage (Cage enforces both).
// Fog-of-war reveal is solving UI, not a final-grid rule; not encoded.

return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C9', 8),
  new Given('R9C1', 6),
  new Given('R9C9', 5),

  new Diagonal(1),  // '/' anti-diagonal: R9C1-R1C9
  new Diagonal(-1), // '\' main diagonal: R1C1-R9C9

  new Cage(15, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(14, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(12, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(15, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(15, 'R7C6', 'R8C5', 'R8C6', 'R9C5'),
  new Cage(15, 'R1C4', 'R2C4', 'R3C3', 'R3C4'),
  new Cage(25, 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R7C3'),
  new Cage(8, 'R5C8', 'R5C9'),
  new Cage(12, 'R4C5', 'R5C5', 'R5C6'),
];
