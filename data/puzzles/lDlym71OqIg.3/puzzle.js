// Title: 2022: Heart in a Cage
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=lDlym71OqIg
// Source: https://tinyurl.com/ycy4y47d
//
// Normal sudoku rules apply. Digits in cages must sum to the total given;
// per killer-cage convention, digits within a cage do not repeat (ISS's
// Cage class enforces this). Cage cells/totals are transcribed from the
// payload's `killercage` array. The single-cell cage (R1C8=2) fixes that
// cell like a given.

return [
  new Shape('9x9'),

  new Given('R6C1', 2),
  new Given('R6C8', 1),
  new Given('R6C9', 4),

  new Cage(4, 'R2C4', 'R3C4'),
  new Cage(5, 'R2C2', 'R2C3'),
  new Cage(3, 'R3C5', 'R4C5'),
  new Cage(6, 'R3C1', 'R3C2'),
  new Cage(7, 'R4C1', 'R5C1'),
  new Cage(8, 'R5C2', 'R6C2'),
  new Cage(9, 'R6C3', 'R7C3'),
  new Cage(16, 'R2C8', 'R3C8'),
  new Cage(15, 'R3C9', 'R4C9'),
  new Cage(14, 'R5C8', 'R5C9'),
  new Cage(13, 'R6C7', 'R7C7'),
  new Cage(12, 'R7C6', 'R8C6'),
  new Cage(11, 'R8C5', 'R9C5'),
  new Cage(10, 'R7C4', 'R8C4'),
  new Cage(17, 'R2C6', 'R2C7'),
  new Cage(14, 'R1C5', 'R1C6', 'R1C7'),
  new Cage(2, 'R1C8'),
];
