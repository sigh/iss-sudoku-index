// Title: VeliX
// Author: Felix
// Video: https://www.youtube.com/watch?v=RznwOkgPe5I
// Source: https://app.crackingthecryptic.com/sudoku/792DQ6mjb3

// Normal 9x9 Sudoku. Xs sum to 10, Vs sum to 5, black dots have a 1:2 ratio,
// and thermometers increase strictly from their circular bulbs.
// Thermometers are transcribed from the four grey bulb-and-line drawings.
return [
  new Shape('9x9'),
  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'),
  new Thermo('R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'),
  new Thermo('R3C7', 'R3C6', 'R3C5'),
  new Thermo('R4C4', 'R4C5', 'R4C6'),
  // The single black-dot domino from the drawn black edge mark.
  new BlackDot('R2C5', 'R2C6'),
  // X dominoes transcribed from the ten drawn X edge marks.
  new X('R9C2', 'R9C3'),
  new X('R9C7', 'R9C8'),
  new X('R7C3', 'R8C3'),
  new X('R7C7', 'R8C7'),
  new X('R2C6', 'R2C7'),
  new X('R2C3', 'R2C4'),
  new X('R2C9', 'R3C9'),
  new X('R2C1', 'R3C1'),
  new X('R4C1', 'R5C1'),
  new X('R4C9', 'R5C9'),
  // V dominoes transcribed from the six drawn V edge marks.
  new V('R8C1', 'R9C1'),
  new V('R8C9', 'R9C9'),
  new V('R7C3', 'R7C4'),
  new V('R7C6', 'R7C7'),
  new V('R6C3', 'R7C3'),
  new V('R6C7', 'R7C7'),
];
