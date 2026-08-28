// Title: Sep 29, 2021: Even Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=_MOJnibGiKY
// Source: https://tinyurl.com/55jrhwcw

// 9x9 grid, standard Sudoku rules (default row/column/box all-different).
// Digits placed in grey squares must be even. There is no Odd/Even class,
// so each grey cell is encoded as a candidate-restricted Given over {2,4,6,8}.

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C6', 6),
  new Given('R1C8', 9),
  new Given('R2C7', 5),
  new Given('R2C9', 8),
  new Given('R3C6', 7),
  new Given('R3C8', 2),
  new Given('R4C5', 6),
  new Given('R4C7', 3),
  new Given('R4C9', 9),
  new Given('R5C4', 9),
  new Given('R5C6', 4),
  new Given('R6C3', 3),
  new Given('R6C5', 5),
  new Given('R7C2', 9),
  new Given('R7C4', 6),
  new Given('R8C1', 8),
  new Given('R8C3', 6),
  new Given('R9C1', 4),
  new Given('R9C2', 7),

  // Grey (even) squares
  new Given('R1C3', 2, 4, 6, 8),
  new Given('R1C5', 2, 4, 6, 8),
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R2C4', 2, 4, 6, 8),
  new Given('R3C1', 2, 4, 6, 8),
  new Given('R3C3', 2, 4, 6, 8),
  new Given('R4C2', 2, 4, 6, 8),
  new Given('R5C1', 2, 4, 6, 8),
  new Given('R5C9', 2, 4, 6, 8),
  new Given('R6C8', 2, 4, 6, 8),
  new Given('R7C7', 2, 4, 6, 8),
  new Given('R7C9', 2, 4, 6, 8),
  new Given('R8C6', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
  new Given('R9C5', 2, 4, 6, 8),
  new Given('R9C7', 2, 4, 6, 8),
];
