// Title: December 26, 2021: Inferno
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=RToyNMs8sFQ
// Source: https://tinyurl.com/3vzesjhy

// Normal sudoku rules apply. Digits along thermometers must strictly increase
// from bulb to tip. Each Thermo lists cells bulb-first, per the source's
// drawn line order.

return [
  new Shape('9x9'),
  new Given('R1C7', 5),
  new Given('R2C2', 4),
  new Given('R4C7', 1),
  new Given('R5C2', 7),
  new Given('R5C5', 3),
  new Given('R5C8', 6),
  new Given('R6C3', 8),
  new Given('R8C8', 9),
  new Given('R9C3', 2),
  new Thermo('R3C2', 'R3C3', 'R4C4', 'R4C5'),
  new Thermo('R2C5', 'R2C6', 'R3C7', 'R3C8'),
  new Thermo('R8C5', 'R8C4', 'R7C3', 'R7C2'),
  new Thermo('R7C8', 'R7C7', 'R6C6', 'R6C5'),
  new Thermo('R6C1', 'R6C2', 'R5C3', 'R5C4'),
  new Thermo('R4C9', 'R4C8', 'R5C7', 'R5C6'),
  new Thermo('R7C5', 'R7C6', 'R8C7', 'R8C8'),
  new Thermo('R3C5', 'R3C4', 'R2C3', 'R2C2'),
  new Thermo('R2C8', 'R2C7', 'R1C6', 'R1C5'),
  new Thermo('R8C2', 'R8C3', 'R9C4', 'R9C5'),
];

