// Title: Thermo Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ySPrdlfPHZs
// Source: https://cracking-the-cryptic.web.app/sudoku/j8QrGR2qjg

// Normal sudoku rules apply (standard rows/columns/3x3 boxes; the payload's
// 9 drawn regions coincide exactly with the usual boxes). The payload carries
// no rules text; the puzzle type is Thermo Sudoku per the video title and the
// 7 drawn thermometer lines: along each thermometer, digits increase from the
// bulb end (Thermo's first cell is the bulb).

const givens = [
  new Given('R1C1', 1),
  new Given('R1C4', 7),
  new Given('R2C2', 5),
  new Given('R2C5', 4),
  new Given('R3C6', 1),
  new Given('R4C3', 9),
  new Given('R4C7', 5),
  new Given('R5C4', 8),
  new Given('R6C1', 2),
  new Given('R6C5', 5),
  new Given('R6C8', 9),
  new Given('R7C6', 5),
  new Given('R9C8', 2),
];

// Thermometers, cell order taken from each drawn line's waypoints, starting
// at the bulb (the endpoint carrying the matching grey circle overlay).
const thermos = [
  new Thermo('R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Thermo('R6C3', 'R7C3', 'R8C3', 'R9C3'),
  new Thermo('R6C7', 'R7C7', 'R8C7'),
  new Thermo('R9C9', 'R9C8', 'R9C7'),
  new Thermo('R2C9', 'R3C9', 'R4C9'),
  new Thermo('R1C7', 'R2C7', 'R3C7', 'R4C7'),
  new Thermo('R1C2', 'R2C2', 'R3C2', 'R4C2'),
];

return [
  new Shape('9x9'),
  ...givens,
  ...thermos,
];
