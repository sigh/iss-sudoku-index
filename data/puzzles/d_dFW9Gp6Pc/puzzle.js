// Title: The Slowest Snake
// Author: Dorlir
// Video: https://www.youtube.com/watch?v=d_dFW9Gp6Pc
// Source: https://sudokupad.app/vw1q7megqm

// Rules encoded: normal sudoku and the three drawn killer cages. The
// solver-discovered snake is omitted; see the accompanying notes.

// Drawn cage cells and totals from the payload's three real cage entries.
return [
  new Shape('9x9'),
  new Cage(6, 'R1C2', 'R2C2'),
  new Cage(6, 'R7C1', 'R8C1'),
  new Cage(6, 'R8C8', 'R9C8'),
];
