// Title: You Make Me Quiver
// Author: Die Hard
// Video: https://www.youtube.com/watch?v=xS8EAm-C4TM
// Source: https://sudokupad.app/e37gpta782

// Normal Sudoku rules apply. Digits on an arrow sum to the digit in the
// attached circle.

// Each entry starts with its circled bulb, followed by the arrow arm.
// Two bulbs (R2C2, R2C8) each anchor two separate arrows.
const arrows = [
  ['R2C2', 'R3C3', 'R3C4'],
  ['R2C2', 'R1C3', 'R1C4'],
  ['R2C8', 'R3C7', 'R4C7'],
  ['R2C8', 'R3C9', 'R4C9'],
  ['R8C8', 'R7C7', 'R7C6'],
  ['R8C2', 'R7C3', 'R6C3'],
  ['R6C6', 'R6C7', 'R5C7'],
  ['R6C5', 'R7C5', 'R7C4'],
  ['R6C4', 'R5C3', 'R4C3'],
  ['R4C4', 'R3C5', 'R3C6'],
  ['R4C8', 'R5C8', 'R6C9'],
].map(cells => new Arrow(...cells));

return [
  new Shape('9x9'),
  ...arrows,
];
