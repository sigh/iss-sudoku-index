// Title: Elasticity
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=r2MwEjPtpK0
// Source: https://app.crackingthecryptic.com/dFQdrJMJpb

// Normal Sudoku rules apply. Each listed cage has distinct digits summing to its clue.
// Cage cells and totals are transcribed from the drawn killer cages.
return [
  new Shape('9x9'),
  new Cage(13, 'R5C1', 'R6C1'),
  new Cage(13, 'R2C1', 'R3C1'),
  new Cage(13, 'R9C4', 'R9C5'),
  new Cage(13, 'R9C7', 'R9C8'),
  new Cage(16, 'R7C2', 'R7C3', 'R8C3'),
  new Cage(9, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(12, 'R1C2', 'R1C3'),
  new Cage(12, 'R1C5', 'R1C6'),
  new Cage(12, 'R4C9', 'R5C9'),
  new Cage(12, 'R7C9', 'R8C9'),
  new Cage(14, 'R2C7', 'R3C7', 'R3C8'),
  new Cage(10, 'R1C8', 'R2C8', 'R2C9'),
  new Cage(15, 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R4C2'),
  new Cage(14, 'R3C5', 'R3C6'),
  new Cage(11, 'R5C3', 'R6C3'),
  new Cage(20, 'R6C8', 'R7C7', 'R7C8', 'R8C6', 'R8C7'),
  new Cage(36, 'R4C6', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R7C4'),
];
