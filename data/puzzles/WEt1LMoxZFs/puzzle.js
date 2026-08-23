// Title: 2021 Thermo Sudoku
// Author: Serhii Tyshchenko
// Video: https://www.youtube.com/watch?v=WEt1LMoxZFs
// Source: https://app.crackingthecryptic.com/sudoku/D4NtNg6tph

// Standard sudoku (default row/column/box all-different; the drawn regions
// are the ordinary nine 3x3 boxes). Along each thermometer, digits strictly
// increase from the bulb (rules text). Each thermometer is one continuous
// cell path with a bulb at one end; Thermo() takes cells in bulb-first order.

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R1C3', 7),
  new Given('R3C1', 8),
  new Given('R7C9', 8),
  new Given('R9C7', 7),
  new Given('R9C9', 3),

  new Thermo('R5C9', 'R4C8'),
  new Thermo('R5C7', 'R4C7', 'R5C8', 'R6C9'),
  new Thermo('R3C7', 'R4C6', 'R5C5', 'R4C4', 'R3C3', 'R2C4', 'R1C5', 'R2C6'),
  new Thermo('R3C4', 'R2C5', 'R3C6', 'R4C5'),
  new Thermo('R4C3', 'R5C4', 'R6C3'),
  new Thermo('R6C4', 'R7C3', 'R6C2', 'R5C3', 'R4C2', 'R5C1'),
  new Thermo('R8C7', 'R9C6', 'R8C5', 'R7C6', 'R6C5', 'R7C4'),
  new Thermo('R6C6', 'R7C7', 'R8C6'),
];
