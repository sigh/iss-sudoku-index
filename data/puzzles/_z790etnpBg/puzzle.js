// Title: My first puzzle
// Author: Rohit Jangid
// Video: https://www.youtube.com/watch?v=_z790etnpBg
// Source: https://app.crackingthecryptic.com/yly7f9rjt8

// Normal Sudoku rules apply. Thermometers increase bulb-to-tip; cages show sums;
// the X and V marks respectively join cells summing to 10 and 5.
// Cage cells are transcribed from the three drawn cage outlines and totals.
const cages = [
  new Cage(6, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(7, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(15, 'R4C4', 'R4C5', 'R5C5', 'R6C5', 'R6C6'),
];

// Thermometer paths are transcribed bulb-to-tip from the grey lines and circles.
const thermos = [
  new Thermo('R1C8', 'R1C9', 'R2C9', 'R3C9'),
  new Thermo('R4C9', 'R5C8', 'R6C7', 'R7C6', 'R8C5', 'R9C4'),
  new Thermo('R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7'),
  new Thermo('R8C4', 'R7C4', 'R6C4', 'R5C4'),
  new Thermo('R2C6', 'R3C6', 'R4C6', 'R5C6'),
  new Thermo('R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3'),
  new Thermo('R6C1', 'R5C2', 'R4C3', 'R3C4', 'R2C5', 'R1C6'),
  new Thermo('R9C2', 'R9C1', 'R8C1', 'R7C1'),
];

return [
  new Shape('9x9'),
  ...cages,
  ...thermos,
  new X('R4C7', 'R5C7'),
  new V('R5C3', 'R6C3'),
];
