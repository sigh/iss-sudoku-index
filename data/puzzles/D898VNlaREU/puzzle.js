// Title: Freelancer
// Author: James Bourque
// Video: https://www.youtube.com/watch?v=D898VNlaREU
// Source: https://app.crackingthecryptic.com/sudoku/BgbP3Mdfbm

// Normal sudoku rules apply: rows, columns and boxes all-different (Shape).
// Cage digits do not repeat and sum to the given total (Cage).
// A digit in a grey square is even; a digit in a grey circle is odd
// (Given restricted to the parity's digit set, per the drawn underlay
// shapes: square = rounded:false, circle = rounded:true).
// Digits on a marked diagonal cannot repeat; both diagonals are drawn in the
// same colour/thickness, so both are "marked" (Diagonal).

return [
  new Shape('9x9'),

  // Givens
  new Given('R2C9', 1),
  new Given('R3C7', 8),
  new Given('R4C1', 4),
  new Given('R4C9', 3),
  new Given('R5C5', 1),
  new Given('R9C5', 7),

  // Cages
  new Cage(7, 'R6C5', 'R7C5'),
  // Plus/cross shape: column 5 rows 1-5, plus row 2 columns 4 and 6.
  new Cage(40, 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C5', 'R4C5', 'R5C5'),
  new Cage(14, 'R1C9', 'R2C8', 'R2C9'),
  new Cage(14, 'R1C1', 'R2C1', 'R2C2'),
  new Cage(14, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(14, 'R7C3', 'R8C2', 'R8C3'),
  new Cage(14, 'R7C7', 'R8C7', 'R8C8'),

  // Grey squares are even.
  new Given('R1C9', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),
  new Given('R9C1', 2, 4, 6, 8),
  new Given('R1C1', 2, 4, 6, 8),

  // Grey circles are odd.
  new Given('R6C5', 1, 3, 5, 7, 9),
  new Given('R2C4', 1, 3, 5, 7, 9),
  new Given('R5C6', 1, 3, 5, 7, 9),

  // Both diagonals are drawn (marked); digits cannot repeat along either.
  new Diagonal(1),
  new Diagonal(-1),
];
