// Title: 5/3/23: The Eye of the Storm
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=GDV0E4mfnpI
// Source: https://tinyurl.com/4cxdxahs
//
// Normal sudoku rules apply.
// Digits along an arrow sum to the digit in its circled bulb, repeats
// allowed on the arm -> one Arrow(bulb, ...arm) per arrow, bulb first.
//
// Arrow bulb/arm cells read off the drawn geometry (each arrow is a
// straight 2-cell arm running from a circled bulb cell).
const arrows = [
  ['R3C4', 'R3C5', 'R3C6'],
  ['R4C7', 'R5C7', 'R6C7'],
  ['R7C6', 'R7C5', 'R7C4'],
  ['R6C3', 'R5C3', 'R4C3'],
  ['R2C3', 'R2C4', 'R2C5'],
  ['R2C7', 'R2C8', 'R3C8'],
  ['R5C8', 'R6C8', 'R7C8'],
  ['R8C7', 'R8C6', 'R8C5'],
  ['R8C3', 'R8C2', 'R7C2'],
  ['R5C2', 'R4C2', 'R3C2'],
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C6', 'R1C7', 'R1C8'],
  ['R2C9', 'R3C9', 'R4C9'],
  ['R6C9', 'R7C9', 'R8C9'],
  ['R9C8', 'R9C7', 'R9C6'],
  ['R9C4', 'R9C3', 'R9C2'],
  ['R8C1', 'R7C1', 'R6C1'],
  ['R4C1', 'R3C1', 'R2C1'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 1), new Given('R1C5', 3), new Given('R1C9', 7),
  new Given('R2C2', 9), new Given('R2C6', 4),
  new Given('R3C3', 4), new Given('R3C7', 9),
  new Given('R4C8', 8),
  new Given('R5C1', 4), new Given('R5C9', 5),
  new Given('R6C2', 7),
  new Given('R7C3', 9), new Given('R7C7', 2),
  new Given('R8C4', 9), new Given('R8C8', 4),
  new Given('R9C1', 8), new Given('R9C5', 6), new Given('R9C9', 9),
  ...arrows.map(cells => new Arrow(...cells)),
];
