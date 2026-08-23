// Title: Killer 6x6 Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/P4LQDq6Nqt

// 6x6 grid, digits 1-6. Shape('6x6') gives the standard row/column/2x3-box
// uniqueness. Killer cages: digits within a cage cannot repeat and must sum
// to the printed total. Cage cells transcribed from the payload's cages
// array (row,col 1-indexed).

return [
  new Shape('6x6'),
  new Cage(6, 'R1C4', 'R2C4', 'R2C3'),
  new Cage(7, 'R2C5', 'R3C5', 'R3C6'),
  new Cage(12, 'R2C1', 'R3C1', 'R3C2'),
  new Cage(7, 'R3C3', 'R4C3'),
  new Cage(10, 'R4C1', 'R4C2', 'R5C2'),
  new Cage(9, 'R5C3', 'R5C4', 'R6C4'),
  new Cage(8, 'R5C5', 'R4C5', 'R4C6'),
];
