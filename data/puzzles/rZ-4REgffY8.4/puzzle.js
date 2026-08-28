// Title: March 27, 2022: How I Set GAS
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=rZ-4REgffY8
// Source: https://tinyurl.com/c6k2pefw

// Normal sudoku rules apply (default 3x3 boxes, all-different rows/cols/boxes).
// Digits along an arrow must sum to the digit in the circled cell it starts
// from. Each circle radiates one or more separate arms; every arm is its own
// Arrow constraint sharing the same circle cell as its first (bulb) argument.
// Arm cell tables below (each row: bulb, arm cell 1, arm cell 2) are
// transcribed from the payload's `arrow` array (each entry's `lines`, whose
// first cell in every line is the shared circled cell).
const arrows = [
  // Circle R5C5 (grid centre), 4 arms
  ['R5C5', 'R4C5', 'R3C5'],
  ['R5C5', 'R5C4', 'R5C3'],
  ['R5C5', 'R5C6', 'R5C7'],
  ['R5C5', 'R6C5', 'R7C5'],
  // Circle R5C9 (right edge, mid), 3 arms
  ['R5C9', 'R5C8', 'R5C7'],
  ['R5C9', 'R4C9', 'R3C9'],
  ['R5C9', 'R6C9', 'R7C9'],
  // Circle R9C5 (bottom edge, mid), 3 arms
  ['R9C5', 'R8C5', 'R7C5'],
  ['R9C5', 'R9C4', 'R9C3'],
  ['R9C5', 'R9C6', 'R9C7'],
  // Circle R1C5 (top edge, mid), 3 arms
  ['R1C5', 'R2C5', 'R3C5'],
  ['R1C5', 'R1C4', 'R1C3'],
  ['R1C5', 'R1C6', 'R1C7'],
  // Circle R5C1 (left edge, mid), 3 arms
  ['R5C1', 'R5C2', 'R5C3'],
  ['R5C1', 'R6C1', 'R7C1'],
  ['R5C1', 'R4C1', 'R3C1'],
  // Circle R3C3 (top-left box centre), 4 arms
  ['R3C3', 'R2C3', 'R1C3'],
  ['R3C3', 'R3C4', 'R3C5'],
  ['R3C3', 'R4C3', 'R5C3'],
  ['R3C3', 'R3C2', 'R3C1'],
  // Circle R3C7 (top-right box centre), 1 arm
  ['R3C7', 'R2C7', 'R1C7'],
  // Circle R7C3 (bottom-left box centre), 1 arm
  ['R7C3', 'R7C4', 'R7C5'],
  // Circle R7C7 (bottom-right box centre), 2 arms
  ['R7C7', 'R8C7', 'R9C7'],
  ['R7C7', 'R6C7', 'R5C7'],
];

return [
  new Shape('9x9'),

  new Given('R2C2', 6), new Given('R2C4', 5), new Given('R2C6', 1), new Given('R2C8', 3),
  new Given('R4C2', 9), new Given('R4C4', 8), new Given('R4C6', 7), new Given('R4C8', 5),
  new Given('R6C2', 2), new Given('R6C4', 9), new Given('R6C6', 3), new Given('R6C8', 4),
  new Given('R8C2', 8), new Given('R8C4', 7), new Given('R8C6', 9), new Given('R8C8', 1),

  ...arrows.map(cells => new Arrow(...cells)),
];
