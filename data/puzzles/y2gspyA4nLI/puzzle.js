// Title: Thermo Sudoku
// Author: Serhii Tyshchenko
// Video: https://www.youtube.com/watch?v=y2gspyA4nLI
// Source: https://app.crackingthecryptic.com/sudoku/fDQqmQ93dJ

// Normal sudoku rules apply (rows, columns, and the 9 standard 3x3 boxes).
// Along each thermometer, digits strictly increase from the bulb (first
// cell below, matching the drawn filled circle) to the tip.

const givens = [
  new Given('R2C4', 5),
  new Given('R2C6', 1),
  new Given('R3C5', 9),
  new Given('R7C5', 1),
  new Given('R8C4', 8),
  new Given('R8C6', 7),
];

// Cell lists transcribed from the drawn thermometers, walked bulb-first;
// each bulb cell matches a filled circle overlay at the same coordinate.
const thermometers = [
  new Thermo('R2C1', 'R2C2', 'R1C2'),
  new Thermo('R1C8', 'R2C7', 'R1C6', 'R2C5', 'R1C4', 'R2C3'),
  new Thermo('R3C7', 'R2C8'),
  new Thermo('R5C8', 'R6C7', 'R7C6', 'R6C5', 'R5C6', 'R4C7'),
  new Thermo('R5C2', 'R4C3', 'R3C4', 'R4C5', 'R5C4', 'R6C3'),
  new Thermo('R7C3', 'R8C2'),
  new Thermo('R9C2', 'R8C3', 'R9C4', 'R8C5', 'R9C6', 'R8C7'),
  new Thermo('R8C9', 'R8C8', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermometers,
];
