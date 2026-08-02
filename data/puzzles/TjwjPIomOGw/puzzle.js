// Title: Killer in the Mist
// Author: Flinty
// Video: https://www.youtube.com/watch?v=TjwjPIomOGw
// Source: https://app.crackingthecryptic.com/sudoku/pFpBDB3fpR

// Normal Sudoku rules apply. Each listed drawn three-cell cage has the printed
// total and contains no repeated digit. Fog and its FOGLIGHT reveal marker are UI.
// Cage coordinates and totals are transcribed from the numbered payload cages.
return [
  new Shape('9x9'),
  new Cage(12, 'R1C4', 'R2C3', 'R2C4'),
  new Cage(12, 'R1C5', 'R1C6', 'R1C7'),
  new Cage(12, 'R2C5', 'R2C6', 'R3C6'),
  new Cage(12, 'R3C4', 'R3C5', 'R4C4'),
  new Cage(10, 'R3C3', 'R4C3', 'R5C3'),
  new Cage(10, 'R2C2', 'R3C2', 'R4C2'),
  new Cage(12, 'R4C5', 'R4C6', 'R4C7'),
  new Cage(12, 'R5C5', 'R5C6', 'R5C7'),
  new Cage(12, 'R5C4', 'R6C4', 'R7C4'),
  new Cage(10, 'R6C2', 'R7C1', 'R7C2'),
  new Cage(22, 'R6C5', 'R6C6', 'R7C5'),
  new Cage(24, 'R6C7', 'R7C7', 'R7C8'),
  new Cage(14, 'R8C3', 'R8C4', 'R8C5'),
  new Cage(20, 'R7C6', 'R8C6', 'R8C7'),
  new Cage(16, 'R8C2', 'R9C1', 'R9C2'),
  new Cage(18, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(8, 'R5C8', 'R6C8', 'R6C9'),
  new Cage(20, 'R2C9', 'R3C8', 'R3C9'),
];
