// Title: Nov 30, 2021: Thermo Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=tT3tiN5GBvQ
// Source: https://tinyurl.com/bnzd2vyx

// Normal Sudoku rules apply. Digits along each thermometer strictly increase
// starting from the bulb (round end). Four thermometers, each listed bulb-first.

return [
  new Shape('9x9'),

  new Given('R1C5', 7),
  new Given('R1C8', 1),
  new Given('R2C4', 5),
  new Given('R2C8', 3),
  new Given('R3C3', 3),
  new Given('R3C8', 5),
  new Given('R4C2', 1),
  new Given('R4C8', 7),
  new Given('R5C5', 1),
  new Given('R6C2', 8),
  new Given('R6C8', 2),
  new Given('R7C2', 6),
  new Given('R7C7', 4),
  new Given('R8C2', 4),
  new Given('R8C6', 6),
  new Given('R9C2', 2),
  new Given('R9C5', 8),

  new Thermo('R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1'),
  new Thermo('R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Thermo('R4C3', 'R3C4', 'R2C5', 'R1C6', 'R1C7'),
  new Thermo('R6C7', 'R7C6', 'R8C5', 'R9C4', 'R9C3'),
];
