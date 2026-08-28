// Title: Taonetonine
// Author: Mystery Setter #1
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/yd3ubtdp

// Normal sudoku rules apply. Six thermometers are drawn; along each,
// digits strictly increase starting from the bulb cell (Thermo's first
// argument is the bulb). No given digits.

return [
  new Shape('9x9'),

  new Thermo('R9C1', 'R8C2', 'R7C3', 'R7C4', 'R8C5', 'R9C6', 'R9C7', 'R8C8', 'R7C9'),
  new Thermo('R2C3', 'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2', 'R3C2'),
  new Thermo('R4C9', 'R5C9', 'R4C8', 'R3C8', 'R2C9', 'R3C9'),
  new Thermo('R9C5', 'R8C4', 'R8C3', 'R9C2'),
  new Thermo('R7C8', 'R8C7', 'R8C6', 'R7C5'),
  new Thermo('R3C4', 'R3C3', 'R4C3', 'R4C4'),
];
