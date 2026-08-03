// Title: June 5, 2023: Hot Line Bling
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=AaC7ehqB3MI
// Source: https://tinyurl.com/466ycec2
//
// Normal sudoku rules apply. Thermo: digits along thermometers must strictly
// increase from bulb to tip. Thermo(...cells) enforces strictly increasing
// values starting at the first-listed cell (the bulb), matching that rule.
// Thermometer cell lists below are transcribed bulb-first from the payload's
// `thermometer` array.

return [
  new Shape('9x9'),

  new Given('R2C8', 4),
  new Given('R4C7', 8),
  new Given('R6C3', 2),
  new Given('R8C2', 6),

  new Thermo('R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new Thermo('R9C8', 'R9C7', 'R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'),
  new Thermo('R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R2C1'),
  new Thermo('R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Thermo('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Thermo('R8C8', 'R8C7', 'R8C6', 'R8C5'),
  new Thermo('R6C2', 'R5C2', 'R4C2'),
  new Thermo('R4C8', 'R5C8', 'R6C8'),
  new Thermo('R3C4', 'R3C5', 'R3C6'),
  new Thermo('R7C6', 'R7C5', 'R7C4'),
];
