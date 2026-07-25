// Title: Arrow vs Thermo
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=kjKeq8fTyS8
// Source: https://sudokupad.app/7yx3e6616s

// Normal sudoku rules (default row/col/box all-different from Shape('9x9')).
// Along a thermometer, digits increase from the bulb end (Thermo's first
// cell is the bulb). Digits along an arrow sum to the digit in that arrow's
// circle (Arrow's first cell is the circle).

const thermos = [
  ['R1C1', 'R2C1', 'R3C1', 'R4C1'],
  ['R1C5', 'R2C5', 'R3C5', 'R4C5'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R9C8', 'R8C8', 'R7C8', 'R6C8'],
  ['R9C2', 'R8C2', 'R7C2', 'R6C2'],
].map(cells => new Thermo(...cells));

const arrows = [
  ['R1C2', 'R2C2', 'R3C2', 'R4C2'],
  ['R1C4', 'R2C4', 'R3C4', 'R4C4'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C6'],
  ['R1C8', 'R2C8', 'R3C8', 'R4C8'],
  ['R9C7', 'R8C7', 'R7C7', 'R6C7'],
  ['R9C5', 'R8C5', 'R7C5', 'R6C5'],
  ['R9C3', 'R8C3', 'R7C3', 'R6C3'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  new Given('R2C2', 1),
  new Given('R3C4', 2),
  new Given('R8C9', 4),
  ...thermos,
  ...arrows,
];
