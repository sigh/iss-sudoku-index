// Title: Face Off at Center Ice
// Author: Will Power
// Video: https://www.youtube.com/watch?v=fGUb_E2W558
// Source: https://sudokupad.app/3ij3v3r73g

// Normal sudoku rules apply. The central 3x3 box is a magic square: its rows,
// columns, and main diagonals have equal sums. Cages have their shown totals
// with no repeated digits; white dots are consecutive, Vs total 5, and Xs total 10.
return [
  new Shape('9x9'),

  // The eight row, column, and diagonal segments drawn by the central magic-square rule.
  new EqualSum(
    ['R4C4', 'R4C5', 'R4C6'],
    ['R5C4', 'R5C5', 'R5C6'],
    ['R6C4', 'R6C5', 'R6C6'],
    ['R4C4', 'R5C4', 'R6C4'],
    ['R4C5', 'R5C5', 'R6C5'],
    ['R4C6', 'R5C6', 'R6C6'],
    ['R4C4', 'R5C5', 'R6C6'],
    ['R4C6', 'R5C5', 'R6C4'],
  ),

  // Cages transcribed from the drawn cage outlines and top-left totals.
  new Cage(38, 'R4C7', 'R5C6', 'R5C7', 'R6C6', 'R6C7', 'R7C7'),
  new Cage(37, 'R3C3', 'R4C3', 'R4C4', 'R5C3', 'R5C4', 'R6C3'),
  new Cage(39, 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C5', 'R4C6'),
  new Cage(36, 'R6C4', 'R6C5', 'R7C3', 'R7C4', 'R7C5', 'R7C6'),

  new WhiteDot('R1C1', 'R2C1'),
  new WhiteDot('R2C1', 'R2C2'),
  new WhiteDot('R1C2', 'R2C2'),
  new WhiteDot('R8C8', 'R8C9'),
  new WhiteDot('R8C8', 'R9C8'),
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R7C2', 'R8C2'),
  new V('R5C1', 'R5C2'),
  new V('R1C5', 'R2C5'),
  new X('R8C5', 'R9C5'),
  new X('R5C8', 'R5C9'),
];
