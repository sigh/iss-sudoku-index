// Title: Ignition!
// Author: Blashyrkh
// Video: https://www.youtube.com/watch?v=OcyN2VakAwo
// Source: https://sudokupad.app/0mrgocdo2k

// Normal sudoku rules apply.
// Thermometers: digits strictly increase from the bulb (first cell) to the
//   tip (last cell).

const thermos = [
  // Drawn thermometer lines, bulb-first cell order.
  ['R3C2', 'R4C1', 'R4C2', 'R4C3', 'R5C3'],
  ['R3C5', 'R3C4', 'R2C4', 'R1C4', 'R2C3'],
  ['R3C6', 'R4C7', 'R4C8', 'R4C9', 'R3C9', 'R2C9'],
  ['R7C2', 'R8C3', 'R7C4', 'R8C4', 'R9C3'],
  ['R6C5', 'R7C6', 'R7C7', 'R6C7', 'R5C6'],
];

return [
  new Shape('9x9'),

  // Given (single clue digit).
  new Given('R8C9', 3),

  // Thermometers (bulb first, strictly increasing to the tip).
  ...thermos.map(cells => new Thermo(...cells)),
];
