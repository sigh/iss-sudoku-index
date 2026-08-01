// Title: Ziplock
// Author: HalfBakedLunatic (David Workman)
// Video: https://www.youtube.com/watch?v=R_2H-U_ljio
// Source: https://app.crackingthecryptic.com/2T2f9JmnpR

// Normal Sudoku, the two givens, and the displayed killer cages.
// Each purple line is a zipper: cells equally distant from its centre sum to that centre.
return [
  new Shape('9x9'),
  new Given('R1C4', 6),
  new Given('R5C7', 5),

  // Cage cells and totals transcribed from the drawn cage labels.
  new Cage(6, 'R1C1', 'R1C2'),
  new Cage(4, 'R1C8', 'R1C9'),
  new Cage(9, 'R5C8', 'R5C9', 'R6C8'),
  new Cage(9, 'R5C2', 'R5C3', 'R6C2'),
  new Cage(7, 'R8C5', 'R9C5', 'R9C6'),
  new Cage(12, 'R1C5', 'R2C4', 'R2C5'),
  new Cage(5, 'R7C1', 'R8C1'),
  new Cage(12, 'R7C9', 'R8C9'),

  new Zipper('R4C4', 'R5C5', 'R6C6'),
  new Zipper('R6C4', 'R5C5', 'R4C6'),
  new Zipper('R2C3', 'R3C4', 'R4C5', 'R3C6', 'R2C7'),
  new Zipper('R2C1', 'R3C2', 'R4C3', 'R5C4', 'R6C3', 'R7C2', 'R8C1'),
  new Zipper('R2C9', 'R3C8', 'R4C7', 'R5C6', 'R6C7', 'R7C8', 'R8C9'),
  new Zipper('R9C2', 'R8C3', 'R7C4', 'R6C5', 'R7C6', 'R8C7', 'R9C8'),
];
