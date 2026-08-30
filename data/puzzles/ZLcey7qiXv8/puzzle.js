// Title: Partial Killer Sudoku
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=ZLcey7qiXv8
// Source: https://cracking-the-cryptic.web.app/sudoku/r8gg9qPHqb

// Normal Sudoku (rows/columns/boxes from the standard 9x9 shape) plus 17
// killer cages covering 40 of the 81 cells; no given digits. Each cage's
// digits are distinct and sum to its printed total (Cage(sum, ...cells)).
// Cage cells and totals transcribed from the drawn cage outlines and totals.

return [
  new Shape('9x9'),

  new Cage(5, 'R1C1', 'R1C2'),
  new Cage(5, 'R1C9', 'R2C9'),
  new Cage(5, 'R9C9', 'R9C8'),
  new Cage(5, 'R8C1', 'R9C1'),
  new Cage(14, 'R5C2', 'R6C2'),
  new Cage(15, 'R6C3', 'R7C3'),
  new Cage(15, 'R8C3', 'R9C3', 'R9C4'),
  new Cage(22, 'R4C4', 'R5C4', 'R6C4'),
  new Cage(8, 'R4C5', 'R4C6'),
  new Cage(7, 'R5C5', 'R5C6'),
  new Cage(8, 'R6C5', 'R6C6'),
  new Cage(15, 'R7C6', 'R7C7'),
  new Cage(18, 'R4C9', 'R5C9', 'R5C8'),
  new Cage(15, 'R3C3', 'R3C4'),
  new Cage(12, 'R2C5', 'R3C5'),
  new Cage(15, 'R3C7', 'R4C7'),
  new Cage(10, 'R3C8', 'R3C9'),
];
