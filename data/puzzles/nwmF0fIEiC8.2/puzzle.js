// Title: October 1, 2021: Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=nwmF0fIEiC8
// Source: https://tinyurl.com/ystvdt9a

// Normal sudoku rules apply. Digits along a thermometer must strictly
// increase starting from the round bulb. Each thermometer's bulb is the
// first cell in its line (per the payload's thermometer entries); no
// bulb sits at any other position, so no reversal ambiguity applies.

return [
  new Shape('9x9'),

  new Given('R1C6', 6),
  new Given('R1C8', 9),
  new Given('R2C7', 5),
  new Given('R2C9', 8),
  new Given('R3C6', 7),
  new Given('R3C8', 2),
  new Given('R4C5', 6),
  new Given('R4C7', 3),
  new Given('R4C9', 9),
  new Given('R5C4', 9),
  new Given('R5C6', 4),
  new Given('R6C3', 3),
  new Given('R6C5', 5),
  new Given('R7C2', 9),
  new Given('R7C4', 6),
  new Given('R8C1', 8),
  new Given('R8C3', 6),
  new Given('R9C1', 4),
  new Given('R9C2', 7),

  new Thermo('R6C4', 'R5C5', 'R4C6'),
  new Thermo('R9C6', 'R9C7', 'R9C8', 'R9C9'),
  new Thermo('R4C1', 'R3C1', 'R2C1', 'R1C1'),
  new Thermo('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Thermo('R8C8', 'R7C8', 'R6C8', 'R5C8'),
];
