// Title: Mercury Drop
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=OiN9ckp_Yio
// Source: https://sudokupad.app/9afnh3qgsf

// Rules encoded:
// - Normal sudoku rules (9x9, standard boxes, no givens).
// - Digits along each thermometer increase from the bulb end -> Thermo.
// - Digits along each arrow sum to the digit in the arrow's circle -> Arrow.
//   Repeats along an arrow are allowed where other rules permit; Arrow does
//   not require distinct arm digits.

// Thermometers, bulb first; from the drawn grey bulb circles and lines.
const thermos = [
  ['R4C3', 'R4C4', 'R4C5', 'R4C6'],
  ['R6C3', 'R6C4', 'R6C5', 'R6C6'],
  ['R3C4', 'R3C5', 'R3C6'],
  ['R1C4', 'R1C5', 'R1C6'],
  ['R7C7', 'R7C6', 'R7C5', 'R7C4'],
  ['R9C7', 'R9C6', 'R9C5', 'R9C4'],
  ['R3C3', 'R4C2'], // diagonal step
];

// Arrows, circle first then arm cells; from the drawn white circles and arrow shafts.
const arrows = [
  ['R5C1', 'R6C2', 'R5C2', 'R5C3'],
  ['R8C9', 'R9C8', 'R8C8', 'R8C7'],
  ['R2C2', 'R2C3', 'R2C4'],
  ['R2C7', 'R2C6', 'R2C5'],
  ['R2C8', 'R3C8', 'R4C7'],
];

return [
  new Shape('9x9'),
  ...thermos.map(cells => new Thermo(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
