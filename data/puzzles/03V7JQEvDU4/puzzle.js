// Title: Killer Pool
// Author: Brinel
// Video: https://www.youtube.com/watch?v=03V7JQEvDU4
// Source: https://app.crackingthecryptic.com/lkmxt8n8dz

// Normal Sudoku applies. Cages have distinct digits summing to their totals.
// Grey squares are even; the grey circle is odd. The nine outlined pool balls
// contain all digits 1 through 9.
// Cage cells and totals are transcribed from the drawn killer cages.
return [
  new Shape('9x9'),
  new Given('R3C1', 1),
  new Given('R3C5', 2),
  new Given('R3C9', 3),
  new Given('R1C1', 2, 4, 6, 8),
  new Given('R1C9', 2, 4, 6, 8),
  new Given('R5C1', 2, 4, 6, 8),
  new Given('R5C9', 2, 4, 6, 8),
  new Given('R9C1', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),
  new Given('R2C5', 1, 3, 5, 7, 9),
  new AllDifferent('R6C5', 'R7C4', 'R7C5', 'R7C6', 'R8C3', 'R8C4', 'R8C5', 'R8C6', 'R8C7'),
  new Cage(3, 'R1C8', 'R1C9'),
  new Cage(2, 'R2C3'),
  new Cage(41, 'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2'),
  new Cage(8, 'R9C2', 'R9C3'),
  new Cage(14, 'R8C5', 'R9C5'),
  new Cage(5, 'R8C6', 'R8C7'),
  new Cage(9, 'R7C9', 'R8C9'),
  new Cage(15, 'R4C9', 'R5C9'),
  new Cage(6, 'R5C7', 'R6C7'),
  new Cage(39, 'R2C8', 'R3C8', 'R4C8', 'R5C8', 'R6C8', 'R7C8', 'R8C8'),
  new Cage(4, 'R2C5', 'R2C6'),
  new Cage(16, 'R3C6', 'R3C7'),
  new Cage(13, 'R3C5', 'R3C4', 'R4C4'),
  new Cage(11, 'R4C5', 'R4C6'),
  new Cage(1, 'R5C5'),
  new Cage(12, 'R5C3', 'R6C3', 'R7C3'),
  new Cage(10, 'R6C4', 'R7C4'),
  new Cage(7, 'R4C1', 'R5C1'),
];
