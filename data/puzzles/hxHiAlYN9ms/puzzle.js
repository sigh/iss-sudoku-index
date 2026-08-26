// Title: Right up to the point
// Author: The autistic kantian
// Video: https://www.youtube.com/watch?v=hxHiAlYN9ms
// Source: https://tinyurl.com/Thermofun

// Standard sudoku (rows, columns, boxes all-different) plus:
// - Thermo: digits strictly increase from the bulb end along each grey line.
// - WhiteDot: digits on the two cells are consecutive.
// - BlackDot: one digit is double the other (2:1 ratio).
// "Not all possible dots are given" means an unmarked adjacency carries no
// constraint either way -- only the drawn dots below are encoded.
// Thermo/dot cell lists transcribed from the payload's thermometer/
// difference/ratio arrays (bulb cell listed first for each thermometer).

return [
  new Shape('9x9'),

  new Thermo('R3C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R1C7'),
  new Thermo('R5C2', 'R4C3', 'R4C4', 'R4C5', 'R4C6', 'R3C7'),
  new Thermo('R6C1', 'R5C1', 'R4C2', 'R3C3'),
  new Thermo('R8C1', 'R7C2', 'R6C3'),
  new Thermo('R6C6', 'R5C7', 'R5C8'),
  new Thermo('R6C2', 'R5C3', 'R5C4', 'R5C5'),
  new Thermo('R8C5', 'R7C6'),
  new Thermo('R8C6', 'R7C7', 'R6C8'),
  new Thermo('R9C2', 'R8C3'),

  new WhiteDot('R6C3', 'R5C3'),
  new WhiteDot('R5C8', 'R5C9'),
  new WhiteDot('R6C8', 'R6C9'),
  new WhiteDot('R3C3', 'R3C4'),
  new WhiteDot('R8C4', 'R8C3'),

  new BlackDot('R4C5', 'R5C5'),
  new BlackDot('R2C7', 'R3C7'),
  new BlackDot('R1C7', 'R1C8'),
  new BlackDot('R6C6', 'R7C6'),
];
