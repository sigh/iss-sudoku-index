// Title: Near-Symmetry
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=U16Sn9TN40w
// Source: https://app.crackingthecryptic.com/sudoku/B9dRqjd7jd

// Standard Sudoku, both marked diagonals, and the drawn killer cages, arrows,
// and thermometers. The blue diagonals run R1C1-R9C9 and R1C9-R9C1.
return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),

  // Killer cage cells and totals transcribed from the drawn cage labels.
  new Cage(22, 'R1C9', 'R2C9', 'R3C9'),
  new Cage(21, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(17, 'R2C4', 'R2C6', 'R3C5', 'R2C5'),
  new Cage(13, 'R5C8', 'R5C9'),
  new Cage(9, 'R6C8', 'R6C9'),
  new Cage(13, 'R5C2', 'R5C1'),
  new Cage(9, 'R6C1', 'R6C2'),
  new Cage(11, 'R7C3', 'R8C3'),
  new Cage(9, 'R7C7', 'R8C7'),
  new Cage(13, 'R8C4', 'R8C5', 'R8C6', 'R9C5'),

  new Arrow('R3C8', 'R4C9', 'R4C8'),
  new Arrow('R4C6', 'R5C6', 'R6C6', 'R6C5'),

  new Thermo('R3C2', 'R4C1', 'R4C2', 'R4C3'),
  new Thermo('R4C5', 'R4C4', 'R5C5', 'R6C5'),
];
