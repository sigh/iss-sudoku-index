// Title: Unveil
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=ESkLcKJyzTA
// Source: https://sudokupad.app/james-sinclair/unveil

// All possible X and V clues are given. There are sixteen Xs and no Vs.
return [
  new Shape('9x9'),

  new Cage(20, 'R5C8', 'R5C9', 'R6C8', 'R6C9'),
  new Cage(20, 'R4C1', 'R4C2', 'R5C1', 'R5C2'),
  new Cage(20, 'R1C5', 'R1C6', 'R2C5', 'R2C6'),
  new Cage(20, 'R8C4', 'R8C5', 'R9C4', 'R9C5'),

  new Renban('R5C7', 'R4C8'),
  new Renban('R1C7', 'R2C8'),

  new X('R6C4', 'R6C5'),
  new X('R7C4', 'R6C4'),
  new X('R7C3', 'R7C4'),
  new X('R8C3', 'R7C3'),
  new X('R5C6', 'R6C6'),
  new X('R6C6', 'R6C7'),
  new X('R6C7', 'R7C7'),
  new X('R7C8', 'R7C7'),
  new X('R4C5', 'R4C6'),
  new X('R4C6', 'R3C6'),
  new X('R3C7', 'R3C6'),
  new X('R3C7', 'R2C7'),
  new X('R4C4', 'R5C4'),
  new X('R4C4', 'R4C3'),
  new X('R3C3', 'R4C3'),
  new X('R3C2', 'R3C3'),
  new StrictXV(),
];
