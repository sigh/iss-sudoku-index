// Title: Bunny Sudoku
// Author: Dennis Parkes
// Video: https://www.youtube.com/watch?v=z8iyLtk9Xu0
// Source: https://app.crackingthecryptic.com/webapp/LnbJtLg9M8

// Standard Sudoku with seven thermometers (digits strictly increase from the
// bulb). Three of the thermos are drawn tip-first in the payload; their cell
// order below is reversed to put the bulb first, per the drawn bulb circle.
return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R4C1', 2),
  new Given('R4C9', 7),
  new Given('R9C1', 3),
  new Given('R9C9', 8),
  new Thermo('R4C4', 'R3C4', 'R2C4', 'R1C4', 'R2C3', 'R3C3', 'R4C3'),
  new Thermo('R4C6', 'R3C6', 'R2C6', 'R1C6', 'R2C7', 'R3C7'),
  new Thermo('R9C8', 'R8C9', 'R7C9', 'R6C9', 'R5C8'),
  new Thermo('R9C2', 'R8C1', 'R7C1', 'R6C1', 'R5C2'),
  new Thermo('R7C3', 'R6C3'),
  new Thermo('R7C7', 'R6C7'),
  new Thermo('R8C5', 'R9C5'),
];
