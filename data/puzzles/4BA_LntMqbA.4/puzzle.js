// Title: Nov 27, 2021: Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=4BA_LntMqbA
// Source: https://tinyurl.com/mshjcs58

// Normal sudoku rules (rows, columns, boxes). Digits along each thermometer
// strictly increase starting at the round bulb, listed first in each Thermo
// call; gaps between consecutive digits need not be 1.

return [
  new Shape('9x9'),

  new Given('R1C4', 6),
  new Given('R1C6', 7),
  new Given('R3C5', 3),
  new Given('R4C4', 1),
  new Given('R4C6', 2),
  new Given('R5C2', 2),
  new Given('R5C8', 3),
  new Given('R6C1', 4),
  new Given('R6C9', 2),
  new Given('R7C2', 7),
  new Given('R7C8', 6),
  new Given('R9C2', 6),
  new Given('R9C8', 5),

  new Thermo('R1C4', 'R2C3', 'R3C2'),
  new Thermo('R1C6', 'R2C7', 'R3C8'),
  new Thermo('R5C2', 'R4C3', 'R3C4'),
  new Thermo('R5C8', 'R4C7', 'R3C6'),
  new Thermo('R5C4', 'R6C3', 'R7C2'),
  new Thermo('R5C6', 'R6C7', 'R7C8'),
  new Thermo('R9C2', 'R8C3', 'R7C4'),
  new Thermo('R9C8', 'R8C7', 'R7C6'),
  new Thermo('R9C3', 'R8C4', 'R7C5', 'R8C6', 'R9C7'),
  new Thermo('R7C7', 'R6C6', 'R5C5', 'R6C4'),
  new Thermo('R3C3', 'R2C4', 'R1C5', 'R2C6'),
];
