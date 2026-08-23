// Title: It's Getting Hot In Here
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=lXUMzC7ExK0
// Source: https://app.crackingthecryptic.com/sudoku/7jmr2DmnPh

// Normal sudoku rules apply. Seven thermometers require digits to strictly
// increase from the bulb (circle) end to the tip. Thermo cell lists below
// are bulb-first, transcribed from the drawn lines.
return [
  new Shape('9x9'),

  new Thermo('R2C6', 'R1C5', 'R1C4', 'R2C3', 'R2C2', 'R2C1'),
  new Thermo('R3C2', 'R4C2'),
  new Thermo('R4C6', 'R3C7', 'R4C7'),
  new Thermo('R5C6', 'R6C7', 'R6C8'),
  new Thermo('R9C8', 'R8C8', 'R7C8', 'R6C9', 'R5C9', 'R4C9'),
  new Thermo('R6C3', 'R5C2', 'R6C2', 'R7C1', 'R8C1', 'R9C1'),
  new Thermo('R9C6', 'R8C5', 'R9C4', 'R9C3'),
];
