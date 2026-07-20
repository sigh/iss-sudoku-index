// Title: Cleaver
// Author: Matt
// Video: https://www.youtube.com/watch?v=2rEZ1a04B18
// Source: https://sudokupad.app/xonlw6pdj7

// Peach lines are entropic: each consecutive triple contains one digit from
// each of 1-3, 4-6, and 7-9.
const entropicLines = [
  ['R3C1', 'R3C2', 'R4C2', 'R4C1', 'R5C1', 'R6C2', 'R5C2', 'R6C3', 'R7C2', 'R6C1'],
  ['R9C8', 'R8C9', 'R7C8', 'R7C9', 'R6C8', 'R6C7', 'R7C7', 'R6C6', 'R7C5', 'R7C6'],
  ['R2C2', 'R3C3', 'R3C4', 'R4C5', 'R3C6', 'R3C7', 'R4C6', 'R5C6', 'R5C5', 'R4C4'],
  ['R3C8', 'R3C9', 'R2C8', 'R1C8', 'R2C7', 'R1C7'],
  ['R6C4', 'R7C3', 'R8C2'],
];

// Each entry starts with its circle, followed by the cells on its arm.
const arrows = [
  ['R5C8', 'R4C9', 'R4C8', 'R4C7'],
  ['R8C5', 'R7C4', 'R6C5'],
  ['R1C6', 'R2C6', 'R3C5'],
  ['R2C1', 'R1C2', 'R1C3'],
  ['R9C1', 'R9C2', 'R8C1'],
];

return [
  new Shape('9x9'),
  ...entropicLines.map(cells => new Entropic(...cells)),
  ...arrows.map(cells => new Arrow(...cells)),
];
