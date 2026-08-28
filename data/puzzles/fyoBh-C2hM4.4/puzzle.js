// Title: January 26, 2022: Equinox
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=fyoBh-C2hM4
// Source: https://tinyurl.com/44nbh3nt

// Normal sudoku rules apply. Digits along each thermometer strictly increase
// from the bulb (first cell listed) to the tip (last cell listed).
const thermos = [
  ['R2C7', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R2C4', 'R2C3', 'R3C3'],
  ['R7C7', 'R8C7', 'R8C6', 'R9C6', 'R9C5', 'R9C4', 'R9C3'],
  ['R8C3', 'R8C2', 'R7C2', 'R6C2', 'R6C1'],
  ['R3C2', 'R3C1', 'R4C1', 'R5C1'],
  ['R4C9', 'R4C8', 'R3C8', 'R2C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R7C8'],
  ['R6C4', 'R7C4', 'R7C5'],
  ['R3C5', 'R3C6', 'R4C6'],
  ['R5C3', 'R4C3', 'R4C4'],
  ['R6C6', 'R6C7', 'R5C7'],
];

return [
  new Shape('9x9'),
  new Given('R5C5', 1),
  ...thermos.map(cells => new Thermo(...cells)),
];
