// Title: Thermo Sudoku
// Author: Clover
// Video: https://www.youtube.com/watch?v=EIWX3buriUE
// Source: https://app.crackingthecryptic.com/sudoku/8mbQn8HFH9

// Standard Sudoku (rows, columns, 3x3 boxes all-different). Along each of the
// 20 drawn thermometers, digits strictly increase starting at the bulb end.
// Cell paths transcribed bulb-to-tip from the drawn lines (each line's bulb
// circle coincides with its first waypoint, confirming the bulb end).
const thermos = [
  new Thermo('R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5'),
  new Thermo('R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8'),
  new Thermo('R2C7', 'R2C6', 'R2C5', 'R2C4'),
  new Thermo('R2C3', 'R2C2', 'R2C1', 'R3C1', 'R3C2'),
  new Thermo('R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R3C8'),
  new Thermo('R3C9', 'R4C9', 'R4C8', 'R4C7', 'R4C6'),
  new Thermo('R4C5', 'R4C4', 'R4C3', 'R4C2', 'R4C1', 'R5C1'),
  new Thermo('R5C2', 'R5C3', 'R5C4', 'R5C5'),
  new Thermo('R5C6', 'R5C7', 'R5C8', 'R5C9', 'R6C9'),
  new Thermo('R6C8', 'R6C7', 'R6C6', 'R6C5'),
  new Thermo('R6C4', 'R6C3'),
  new Thermo('R6C2', 'R6C1'),
  new Thermo('R7C1', 'R7C2', 'R7C3'),
  new Thermo('R7C4', 'R7C5', 'R7C6'),
  new Thermo('R7C9', 'R7C8', 'R7C7'),
  new Thermo('R8C9', 'R8C8'),
  new Thermo('R8C7', 'R8C6'),
  new Thermo('R8C5', 'R8C4'),
  new Thermo('R8C1', 'R8C2', 'R8C3'),
  new Thermo('R9C4', 'R9C5', 'R9C6', 'R9C7'),
];

return [
  new Shape('9x9'),
  ...thermos,
];
