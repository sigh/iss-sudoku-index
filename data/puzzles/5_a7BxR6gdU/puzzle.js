// Title: X+V=15
// Author: Spelldaddy
// Video: https://www.youtube.com/watch?v=5_a7BxR6gdU
// Source: https://app.crackingthecryptic.com/sudoku/d4PdD2Bq96

// Standard 9x9 Sudoku. Cages have the drawn totals and no repeated digit.
// X and V marks, transcribed from the drawn edge labels, respectively total 10 and 5;
// the rules say the marks are not exhaustive, so no negative XV rule is added.
return [
  new Shape('9x9'),

  // Drawn killer cages.
  new Cage(15, 'R1C4', 'R1C3', 'R1C2', 'R2C2'),
  new Cage(15, 'R8C2', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(15, 'R9C9', 'R9C8'),
  new Cage(15, 'R8C8', 'R8C7', 'R8C6', 'R9C6', 'R9C7'),
  new Cage(15, 'R8C5', 'R9C5'),
  new Cage(6, 'R5C8', 'R6C8', 'R6C9'),
  new Cage(15, 'R4C7', 'R5C7', 'R6C7'),
  new Cage(11, 'R5C4', 'R5C5', 'R6C5', 'R6C4'),
  new Cage(15, 'R3C3', 'R4C3', 'R5C3'),
  new Cage(15, 'R1C7', 'R1C8', 'R2C8', 'R3C8'),

  new X('R2C8', 'R3C8'),
  new X('R7C6', 'R7C7'),
  new X('R6C2', 'R7C2'),
  new X('R3C2', 'R4C2'),

  new V('R1C3', 'R1C4'),
  new V('R2C5', 'R3C5'),
  new V('R5C4', 'R6C4'),
  new V('R9C3', 'R9C4'),
];
