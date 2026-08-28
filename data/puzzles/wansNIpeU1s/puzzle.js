// Title: Rossini Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=wansNIpeU1s
// Source: https://cracking-the-cryptic.web.app/sudoku/p6Pb99bbDr

// Normal sudoku rules apply (9x9, standard 3x3 boxes).
//
// Rossini arrows: outside each edge with a drawn arrow, the three cells of
// that row/column nearest the edge strictly increase in the direction the
// arrowhead points. Each Thermo below lists those three cells smallest to
// largest, matching Thermo's own "increasing from the bulb" semantics --
// the bulb is the smallest-valued cell, which is the edge-adjacent cell when
// the arrow points into the grid, and the innermost of the three when it
// points away.

return [
  new Shape('9x9'),

  new Given('R4C4', 6),
  new Given('R5C5', 4),
  new Given('R6C6', 3),

  // Top-of-grid arrows (columns, first three cells from row 1).
  new Thermo('R1C3', 'R2C3', 'R3C3'),
  new Thermo('R3C4', 'R2C4', 'R1C4'),
  new Thermo('R3C6', 'R2C6', 'R1C6'),
  new Thermo('R3C7', 'R2C7', 'R1C7'),
  new Thermo('R3C9', 'R2C9', 'R1C9'),

  // Bottom-of-grid arrows (columns, first three cells from row 9).
  new Thermo('R7C2', 'R8C2', 'R9C2'),
  new Thermo('R9C4', 'R8C4', 'R7C4'),
  new Thermo('R7C7', 'R8C7', 'R9C7'),
  new Thermo('R9C8', 'R8C8', 'R7C8'),
  new Thermo('R9C9', 'R8C9', 'R7C9'),

  // Left-of-grid arrows (rows, first three cells from column 1).
  new Thermo('R1C1', 'R1C2', 'R1C3'),
  new Thermo('R2C1', 'R2C2', 'R2C3'),
  new Thermo('R3C3', 'R3C2', 'R3C1'),
  new Thermo('R5C3', 'R5C2', 'R5C1'),
  new Thermo('R7C3', 'R7C2', 'R7C1'),
  new Thermo('R9C1', 'R9C2', 'R9C3'),

  // Right-of-grid arrows (rows, first three cells from column 9).
  new Thermo('R1C9', 'R1C8', 'R1C7'),
  new Thermo('R2C9', 'R2C8', 'R2C7'),
  new Thermo('R3C9', 'R3C8', 'R3C7'),
  new Thermo('R4C7', 'R4C8', 'R4C9'),
  new Thermo('R7C7', 'R7C8', 'R7C9'),
];
