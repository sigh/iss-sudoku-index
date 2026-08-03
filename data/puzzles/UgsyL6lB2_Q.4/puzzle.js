// Title: May 24, 2023: Thermoglyphs
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=UgsyL6lB2_Q
// Source: https://tinyurl.com/mr2ez7kb

// Normal sudoku rules apply. Eight thermometers: digits must strictly
// increase from bulb (circle end, first cell of each Thermo call) to tip.
// Cell lists below are transcribed from the payload's thermometer[].lines[]
// arrays in source order, bulb first.

return [
  new Shape('9x9'),

  new Given('R1C6', 5),
  new Given('R2C2', 1),
  new Given('R2C8', 3),
  new Given('R4C1', 4),
  new Given('R5C2', 9),
  new Given('R5C5', 7),
  new Given('R5C8', 2),
  new Given('R6C9', 6),
  new Given('R8C2', 5),
  new Given('R8C8', 8),
  new Given('R9C4', 5),

  new Thermo('R6C6', 'R6C7', 'R6C8', 'R7C8', 'R8C7', 'R8C6', 'R7C6'),
  new Thermo('R4C4', 'R4C3', 'R4C2', 'R3C2', 'R2C3', 'R2C4', 'R3C4'),
  new Thermo('R3C6', 'R2C6', 'R2C7', 'R3C8', 'R4C7', 'R4C6'),
  new Thermo('R7C4', 'R8C4', 'R8C3', 'R7C2', 'R6C3', 'R6C4'),
  new Thermo('R5C6', 'R5C7', 'R4C8'),
  new Thermo('R5C4', 'R5C3', 'R6C2'),
  new Thermo('R2C5', 'R3C5', 'R4C5'),
  new Thermo('R8C5', 'R7C5', 'R6C5'),
];
