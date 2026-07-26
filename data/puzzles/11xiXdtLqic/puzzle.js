// Title: Exhausting
// Author: BremSter & Sotek
// Video: https://www.youtube.com/watch?v=11xiXdtLqic
// Source: https://sudokupad.app/mfvog22gzk

// Normal sudoku (standard 3x3 boxes) plus:
// - No repeated digits along either main diagonal (R1C1-R9C9 and R9C1-R1C9).
// - Cage(sum, cells) below is a killer cage: sums to `sum` and all-different,
//   matching "must sum to the number in the top left corner ... may not
//   repeat within cages".
// Fog is solving UI only (revealed progressively as correct digits are
// placed) and has no effect on the final grid, so it is not encoded.

return [
  new Shape('9x9'),

  new Diagonal(-1), // R1C1-R9C9 ('\')
  new Diagonal(1),  // R9C1-R1C9 ('/')

  new Cage(6, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(7, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(7, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(9, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(3, 'R5C5', 'R6C5'),
  new Cage(15, 'R6C7', 'R7C6', 'R7C7'),
  new Cage(15, 'R2C7', 'R3C7', 'R3C8'),
  new Cage(15, 'R2C4', 'R2C5', 'R2C6'),
  new Cage(15, 'R2C3', 'R3C2', 'R3C3'),
  new Cage(15, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(15, 'R4C2', 'R5C2', 'R5C3'),
  new Cage(9, 'R7C4', 'R7C5'),
];
