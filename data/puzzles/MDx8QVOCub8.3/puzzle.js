// Title: 5 Thermos and a Dream
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=MDx8QVOCub8
// Source: https://sudokupad.app/ad5bkp229i

// Irregular Sudoku: place 1-6 once each in every row, column, and irregular
// region (no default 2x3 boxes).
// Thermometers: digits on a grey thermometer increase from the bulb (circle
// end) to the tip.

const regions = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C2', 'R3C2', 'R4C2'],
  ['R2C1', 'R3C1', 'R4C1', 'R5C1', 'R5C2', 'R6C1'],
  ['R3C3', 'R4C3', 'R5C3', 'R5C4', 'R6C2', 'R6C3'],
  ['R1C4', 'R1C5', 'R2C3', 'R2C4', 'R3C4', 'R4C4'],
  ['R3C6', 'R4C6', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R1C6', 'R2C5', 'R2C6', 'R3C5', 'R4C5', 'R5C5'],
];

const thermos = [
  ['R1C1', 'R1C2', 'R1C3'],
  ['R6C2', 'R6C3', 'R6C4'],
  ['R5C6', 'R5C5', 'R5C4'],
  ['R4C2', 'R4C3'],
  ['R2C5', 'R2C4'],
];

return [
  new Shape('6x6'),
  new NoBoxes(),
  ...regions.map((cells) => new Jigsaw('6x6', ...cells)),
  ...thermos.map((cells) => new Thermo(...cells)),
];
