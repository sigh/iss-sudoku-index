// Title: August 9, 2023: Thermo
// Author: clover!
// Video: https://www.youtube.com/watch?v=fI46Yf_Zug8
// Source: https://tinyurl.com/yfbc6z6b

// Normal sudoku rules apply. Digits along thermometers must increase,
// starting from the round bulb (cell order below is bulb first, per the
// source's own thermometer line order).

return [
  new Shape('9x9'),

  new Given('R1C5', 7),
  new Given('R2C8', 4),
  new Given('R3C4', 5),
  new Given('R3C5', 1),
  new Given('R3C6', 6),
  new Given('R4C3', 6),
  new Given('R4C7', 4),
  new Given('R5C1', 9),
  new Given('R5C3', 2),
  new Given('R5C7', 6),
  new Given('R5C9', 7),
  new Given('R6C3', 8),
  new Given('R6C7', 2),
  new Given('R7C4', 4),
  new Given('R7C5', 5),
  new Given('R7C6', 9),
  new Given('R8C2', 8),
  new Given('R9C5', 6),

  new Thermo('R3C5', 'R4C6', 'R4C7'),
  new Thermo('R5C7', 'R6C6', 'R7C6'),
  new Thermo('R7C5', 'R6C4', 'R6C3'),
  new Thermo('R5C3', 'R4C4', 'R3C4'),
  new Thermo('R3C8', 'R4C8', 'R5C9'),
  new Thermo('R7C2', 'R6C2', 'R5C1'),
  new Thermo('R2C3', 'R2C4', 'R1C5'),
  new Thermo('R8C7', 'R8C6', 'R9C5'),
  new Thermo('R7C4', 'R8C3', 'R9C3'),
  new Thermo('R3C6', 'R2C7', 'R1C7'),
  new Thermo('R4C3', 'R3C2', 'R3C1'),
  new Thermo('R6C7', 'R7C8', 'R7C9'),
];
