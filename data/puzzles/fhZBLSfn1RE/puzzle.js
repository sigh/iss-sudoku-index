// Title: Dune: The Mentat's Diversion
// Author: HalfBakedLunatic
// Video: https://www.youtube.com/watch?v=fhZBLSfn1RE
// Source: https://app.crackingthecryptic.com/Q7Bf3BHbfP

// Normal Sudoku. Dashed cages have distinct digits summing to their labels.
// Red Sapho Juice thermometers increase from their circular bulbs. Black dots are 2:1 ratios.
// Cage cell lists and totals are transcribed from the drawn dashed cages.
return [
  new Shape('9x9'),
  new Cage(27, 'R1C3', 'R1C4', 'R2C1', 'R2C2', 'R2C3'),
  new Cage(30, 'R1C6', 'R1C7', 'R2C7', 'R2C8', 'R2C9'),
  new Cage(25, 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1'),
  new Cage(25, 'R4C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5'),
  new Cage(25, 'R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C9'),
  new Cage(30, 'R7C3', 'R8C1', 'R8C2', 'R8C3', 'R9C3'),
  new Cage(19, 'R7C7', 'R8C7', 'R8C8', 'R8C9', 'R9C7'),
  new Thermo('R3C6', 'R3C5', 'R3C4', 'R4C4'),
  new Thermo('R4C1', 'R4C2', 'R3C2', 'R3C3'),
  new Thermo('R4C9', 'R4C8', 'R3C8', 'R3C7'),
  new Thermo('R6C3', 'R6C2', 'R7C2', 'R7C1'),
  new Thermo('R6C7', 'R6C8', 'R7C8', 'R7C9'),
  new Thermo('R7C4', 'R7C5', 'R7C6', 'R6C6'),
  new BlackDot('R1C8', 'R1C9'),
  new BlackDot('R9C8', 'R9C9'),
  new BlackDot('R9C1', 'R9C2'),
  new BlackDot('R1C1', 'R1C2'),
  new BlackDot('R6C4', 'R7C4'),
  new BlackDot('R3C6', 'R4C6'),
];
