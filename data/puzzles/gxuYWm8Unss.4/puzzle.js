// Title: Same Ghost Every Night
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=gxuYWm8Unss
// Source: https://tinyurl.com/yqmfyjua

// Normal Sudoku rules apply. Digits on each listed arrow shaft sum to its
// circular bulb. The arrow cells are transcribed from the twelve grey arrows.
const arrows = [
  ['R3C1', 'R4C2'],
  ['R2C1', 'R3C2', 'R4C3'],
  ['R1C1', 'R2C2', 'R3C3', 'R4C4'],
  ['R1C7', 'R2C6'],
  ['R1C8', 'R2C7', 'R3C6'],
  ['R1C9', 'R2C8', 'R3C7', 'R4C6'],
  ['R7C9', 'R6C8'],
  ['R8C9', 'R7C8', 'R6C7'],
  ['R9C9', 'R8C8', 'R7C7', 'R6C6'],
  ['R9C3', 'R8C4'],
  ['R9C2', 'R8C3', 'R7C4'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4'],
];

return [
  new Shape('9x9'),
  new Given('R1C1', 4), new Given('R1C7', 7), new Given('R1C8', 9), new Given('R1C9', 5),
  new Given('R2C1', 9), new Given('R3C1', 7),
  new Given('R5C1', 2), new Given('R5C3', 6), new Given('R5C7', 8), new Given('R5C9', 1),
  new Given('R7C9', 7), new Given('R8C9', 9),
  new Given('R9C1', 6), new Given('R9C2', 9), new Given('R9C3', 4), new Given('R9C9', 8),
  ...arrows.map(([bulb, ...shaft]) => new Arrow(bulb, ...shaft)),
];
