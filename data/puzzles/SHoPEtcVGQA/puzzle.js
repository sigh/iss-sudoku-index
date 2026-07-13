// Title: Basic Math
// Author: charmquark
// Video: https://www.youtube.com/watch?v=SHoPEtcVGQA
// Source: https://sudokupad.app/hq1yn5i2hq

// Normal sudoku rules apply.
return [
  new Shape('9x9'),

  // XV: cells joined by an X sum to 10.
  new X('R2C1', 'R2C2'),
  new X('R1C8', 'R2C8'),
  new X('R5C2', 'R5C3'),
  new X('R7C5', 'R8C5'),
  new X('R9C1', 'R9C2'),
  new X('R4C5', 'R4C6'),

  // XV: cells joined by a V sum to 5.
  new V('R2C5', 'R3C5'),
  new V('R5C7', 'R5C8'),
  new V('R8C4', 'R9C4'),
  new V('R4C7', 'R4C8'),

  // Killer cages: digits sum to the corner total and cannot repeat.
  new Cage(9, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(18, 'R2C1', 'R3C1', 'R3C2'),
  new Cage(18, 'R2C2', 'R2C3', 'R3C3'),
  new Cage(4, 'R2C7', 'R2C8'),
  new Cage(26, 'R1C7', 'R1C8', 'R1C9', 'R2C9'),
  new Cage(15, 'R3C7', 'R3C8', 'R3C9'),
  new Cage(17, 'R4C7', 'R4C8', 'R5C8', 'R6C8', 'R6C9'),
  new Cage(15, 'R4C2', 'R4C3', 'R5C3', 'R6C2', 'R6C3'),
  new Cage(13, 'R5C1', 'R5C2'),
  new Cage(7, 'R7C9', 'R8C9'),
  new Cage(10, 'R9C7', 'R9C8', 'R9C9'),
  new Cage(4, 'R7C1', 'R8C1'),
  new Cage(16, 'R7C3', 'R8C3'),
  new Cage(16, 'R7C4', 'R7C5', 'R7C6'),
];
