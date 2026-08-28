// Title: Grizzly Bear
// Author: Spef & DawNeD
// Video: https://www.youtube.com/watch?v=ODJNVEuPNVk
// Source: https://tinyurl.com/2p92h3zc

// Normal sudoku rules apply. Seven thermometers: digits strictly increase
// moving away from each bulb (Thermo's baseline semantics). No givens.
// Each Thermo lists cells bulb-first, per the drawn waypoint order.

return [
  new Shape('9x9'),

  new Thermo('R1C7', 'R2C7', 'R3C7', 'R4C6', 'R5C6', 'R6C6'),
  new Thermo('R1C3', 'R2C3', 'R3C4', 'R4C4', 'R5C4', 'R6C4'),
  new Thermo('R2C9', 'R2C8', 'R3C8', 'R4C8', 'R5C9'),
  new Thermo('R2C1', 'R2C2', 'R3C2', 'R4C2', 'R5C1'),
  new Thermo('R7C1', 'R8C2', 'R9C3'),
  new Thermo('R6C7', 'R7C6', 'R8C5', 'R9C4'),
  new Thermo('R9C9', 'R8C8', 'R7C7'),
];
