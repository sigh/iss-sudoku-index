// Title: Fireworks
// Author: SamuPiano
// Video: https://www.youtube.com/watch?v=9xevqS2yNVo
// Source: https://sudokupad.app/3t54tkflmx

// Normal Sudoku; thermometer digits increase from each drawn bulb.
return [
  new Shape('9x9'),
  // The three printed givens.
  new Given('R2C6', 3),
  new Given('R4C4', 6),
  new Given('R9C9', 1),
  // Grey shafts, ordered from their matching grey circular bulbs.
  new Thermo('R2C2', 'R1C1'),
  new Thermo('R2C3', 'R1C4'),
  new Thermo('R3C2', 'R4C1'),
  new Thermo('R3C3', 'R4C4'),
  new Thermo('R6C3', 'R5C4'),
  new Thermo('R6C2', 'R5C1'),
  new Thermo('R7C2', 'R8C1'),
  new Thermo('R7C3', 'R8C4', 'R9C4'),
  new Thermo('R3C7', 'R4C8'),
  new Thermo('R3C7', 'R3C6', 'R4C5'),
  new Thermo('R2C6', 'R1C5'),
  new Thermo('R2C7', 'R1C8'),
  new Thermo('R6C6', 'R5C5'),
  new Thermo('R7C6', 'R8C5'),
  new Thermo('R7C7', 'R8C8'),
  new Thermo('R7C7', 'R6C7', 'R5C8'),
  new Thermo('R3C4', 'R4C3'),
];
