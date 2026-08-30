// Title: A Sublime 'Odd Even' Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Q7hhVgE8zGM
// Source: https://cracking-the-cryptic.web.app/sudoku/8bNmDd4J9G

// Rules encoded here:
//   * Normal sudoku rules apply (default row/column/box all-different; the
//     payload's regions are the standard nine 3x3 boxes).
//   * Digits in grey circles must be odd; digits in grey squares must be
//     even. No dedicated Odd/Even class exists, so each marked cell is a
//     Given restricted to the odd or even digits (per iss-constraints
//     catalog).
// Nothing is omitted.
return [
  new Shape('9x9'),

  new Given('R1C6', 7),
  new Given('R1C7', 2),
  new Given('R1C8', 1),
  new Given('R1C9', 6),
  new Given('R2C6', 4),
  new Given('R2C7', 9),
  new Given('R2C8', 7),
  new Given('R2C9', 5),
  new Given('R8C1', 2),
  new Given('R8C2', 7),
  new Given('R8C3', 4),
  new Given('R8C4', 5),
  new Given('R9C1', 9),
  new Given('R9C2', 5),
  new Given('R9C3', 8),
  new Given('R9C4', 2),

  // Grey circles (odd) -- transcribed from the payload's rounded underlays.
  new Given('R2C3', 1, 3, 5, 7, 9),
  new Given('R3C2', 1, 3, 5, 7, 9),
  new Given('R3C4', 1, 3, 5, 7, 9),
  new Given('R4C2', 1, 3, 5, 7, 9),
  new Given('R4C4', 1, 3, 5, 7, 9),
  new Given('R5C2', 1, 3, 5, 7, 9),
  new Given('R5C4', 1, 3, 5, 7, 9),
  new Given('R6C3', 1, 3, 5, 7, 9),

  // Grey squares (even) -- transcribed from the payload's square underlays.
  new Given('R4C7', 2, 4, 6, 8),
  new Given('R4C8', 2, 4, 6, 8),
  new Given('R5C6', 2, 4, 6, 8),
  new Given('R6C6', 2, 4, 6, 8),
  new Given('R6C7', 2, 4, 6, 8),
  new Given('R6C8', 2, 4, 6, 8),
  new Given('R7C6', 2, 4, 6, 8),
  new Given('R8C7', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
];
