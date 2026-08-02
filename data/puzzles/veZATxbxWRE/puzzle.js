// Title: Mut zur Lucke!
// Author: Wuschel
// Video: https://www.youtube.com/watch?v=veZATxbxWRE
// Source: https://app.crackingthecryptic.com/q9tbRnF4Nh

// Normal Sudoku; the drawn main diagonal has distinct digits.
// Each listed cage has its drawn total and no repeated digit.
// The V on the R1C1/R2C1 edge points to R2C1, the smaller digit.
return [
  new Shape('9x9'),
  new Diagonal(-1),
  new GreaterThan('R1C1', 'R2C1'),
  // Cages transcribed from the drawn cage outlines and totals.
  new Cage(12, 'R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Cage(20, 'R5C3', 'R5C2', 'R5C1', 'R6C1'),
  new Cage(28, 'R7C2', 'R7C3', 'R8C3', 'R9C3'),
  new Cage(28, 'R6C6', 'R7C6', 'R8C6', 'R7C5'),
  new Cage(12, 'R2C4', 'R3C4', 'R4C4', 'R3C5'),
  new Cage(20, 'R1C5', 'R1C6', 'R1C7', 'R2C7'),
  new Cage(12, 'R3C8', 'R3C7', 'R4C7', 'R5C7'),
  new Cage(28, 'R6C9', 'R7C9', 'R5C9', 'R7C8'),
];
