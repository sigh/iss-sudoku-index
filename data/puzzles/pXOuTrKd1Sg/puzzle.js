// Title: Unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pXOuTrKd1Sg
// Source: https://cracking-the-cryptic.web.app/sudoku/t4Rqr9JD48

// Normal sudoku rules apply. Digits increase along thermometers from the
// bulb(s) to the end. Twelve thermometers are drawn in two rendering colours;
// every bulb's fill colour matches its own line one-to-one and the rules give
// colour no separate meaning, so all read as one uniform family. Thermo takes
// cells bulb-first and enforces a strictly increasing sequence.

return [
  new Shape('9x9'),

  new Thermo('R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'),
  new Thermo('R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'),
  new Thermo('R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5'),
  new Thermo('R9C9', 'R8C8', 'R7C7', 'R6C6', 'R5C5'),
  new Thermo('R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5'),
  new Thermo('R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5'),
  new Thermo('R8C4', 'R7C3', 'R6C2'),
  new Thermo('R8C6', 'R7C7', 'R6C8'),
  new Thermo('R2C3', 'R3C4', 'R4C5'),
  new Thermo('R2C8', 'R3C7', 'R4C6'),
  new Thermo('R2C7', 'R3C6'),
  new Thermo('R3C5', 'R2C4', 'R1C3'),
];
