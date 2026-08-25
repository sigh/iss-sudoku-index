// Title: ME3
// Author: Colonel
// Video: https://www.youtube.com/watch?v=bOsEgOXAmsc
// Source: https://app.crackingthecryptic.com/sudoku/7b3Gq4M2J6
//
// Normal Sudoku rules apply. Digits must increase along thermometers from the
// bulb(s) to the end(s). Several drawn strokes are tip-first in the payload;
// they are reversed here to bulb-first order using each stroke's circle
// overlay (see below). One stroke's circle overlay sits at an interior cell
// (R3C7) rather than either drawn endpoint: with the rules' "bulb(s)" plural,
// that mark is read as a shared bulb from which two arms increase, so that
// stroke is encoded as two Thermo constraints sharing the R3C7 cell.

return [
  new Shape('9x9'),

  new Given('R1C5', 1),
  new Given('R1C7', 3),

  new Thermo('R3C2', 'R3C3', 'R2C3', 'R1C3', 'R2C2', 'R1C1', 'R2C1', 'R3C1'),
  new Thermo('R4C4', 'R4C3', 'R4C2', 'R4C1', 'R5C1'),
  new Thermo('R7C1', 'R7C2', 'R7C3'),
  new Thermo('R8C1', 'R8C2', 'R8C3'),
  new Thermo('R9C1', 'R9C2', 'R9C3'),
  new Thermo('R1C7', 'R1C8', 'R1C9'),
  new Thermo('R2C7', 'R2C8', 'R2C9'),
  new Thermo('R3C7', 'R3C8', 'R3C9'),
  new Thermo('R3C7', 'R4C7', 'R5C7'),
  new Thermo('R4C6', 'R4C7', 'R4C8', 'R4C9'),
  new Thermo('R6C8', 'R6C7', 'R6C6', 'R6C5', 'R6C4', 'R6C3', 'R6C2'),
  new Thermo('R7C4', 'R6C4'),
  new Thermo('R8C5', 'R7C5', 'R6C5'),
  new Thermo('R9C6', 'R8C6', 'R7C6', 'R6C6'),
  new Thermo('R8C9', 'R7C8', 'R7C9'),
];
