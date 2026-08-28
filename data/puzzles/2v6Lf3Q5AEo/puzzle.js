// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=2v6Lf3Q5AEo
// Source: https://cracking-the-cryptic.web.app/sudoku/BLNJndRPHh

// Each row, column and boldly outlined 3x3 box contains each digit 1-9 exactly
// once (the ISS 9x9 baseline). Clues inside a small cage give the sum of the
// digits in that cage, and digits may not repeat within a small cage. There are
// no givens.

return [
  new Shape('9x9'),

  // Cage cell lists and totals transcribed from the drawn cages; the 23 cages
  // partition all 81 cells and their totals sum to 405.
  new Cage(28, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1', 'R4C1'),
  new Cage(12, 'R1C4', 'R1C5', 'R1C6'),
  new Cage(22, 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Cage(14, 'R3C9', 'R4C9', 'R5C9'),
  new Cage(23, 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'),
  new Cage(17, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(20, 'R9C1', 'R9C2', 'R9C3', 'R8C1'),
  new Cage(10, 'R5C1', 'R6C1', 'R7C1'),
  new Cage(16, 'R2C2', 'R2C3', 'R2C4'),
  new Cage(10, 'R2C5', 'R3C5'),
  new Cage(10, 'R2C6', 'R2C7', 'R3C7'),
  new Cage(13, 'R2C8', 'R3C8'),
  new Cage(12, 'R3C2', 'R3C3', 'R4C2'),
  new Cage(33, 'R3C4', 'R4C3', 'R4C4', 'R5C3', 'R5C4'),
  new Cage(23, 'R3C6', 'R4C6', 'R4C7', 'R4C8', 'R5C8'),
  new Cage(13, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(31, 'R5C2', 'R6C2', 'R6C3', 'R6C4', 'R7C4'),
  new Cage(31, 'R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C6'),
  new Cage(19, 'R6C8', 'R7C7', 'R7C8'),
  new Cage(12, 'R7C2', 'R8C2'),
  new Cage(11, 'R7C3', 'R8C3', 'R8C4'),
  new Cage(10, 'R7C5', 'R8C5'),
  new Cage(15, 'R8C6', 'R8C7', 'R8C8'),
];
