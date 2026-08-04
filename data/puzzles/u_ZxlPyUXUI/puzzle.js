// Title: Wall of Hell Fire
// Author: Logan 'the' Wall
// Video: https://www.youtube.com/watch?v=u_ZxlPyUXUI
// Source: https://app.crackingthecryptic.com/sudoku/fRg4TRPTrn

// Normal sudoku rules apply. Seven thermometers require digits to increase
// from bulb to tip; each bulb is the first cell listed below, matching the
// drawn circle overlay at that end of every line.

return [
  new Shape('9x9'),

  new Given('R2C9', 4),

  new Thermo('R2C5', 'R2C6', 'R3C7'),
  new Thermo('R4C3', 'R3C2', 'R2C1', 'R1C1'),
  new Thermo('R4C6', 'R4C5', 'R4C4', 'R3C4', 'R2C3'),
  new Thermo('R5C2', 'R6C3', 'R5C4', 'R6C5', 'R5C6'),
  new Thermo('R5C1', 'R6C2', 'R7C3', 'R6C4', 'R7C5', 'R6C6', 'R5C7'),
  new Thermo('R7C7', 'R8C7', 'R9C6', 'R9C5'),
  new Thermo('R7C2', 'R8C3', 'R9C4', 'R8C4'),
];
