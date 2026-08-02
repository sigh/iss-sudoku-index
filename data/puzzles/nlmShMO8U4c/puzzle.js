// Title: Chasing Arrows
// Author: Blobz
// Video: https://www.youtube.com/watch?v=nlmShMO8U4c
// Source: https://sudokupad.app/blobz/chasing-arrows

// Normal Sudoku. Each listed circle cell equals the sum of its arrow arm; arm
// digits may repeat. The fog-clearing presentation mechanic is omitted because
// it adds no final-grid constraint.
const arrows = [
  ['R1C3', 'R2C2', 'R1C2'],
  ['R2C1', 'R3C2', 'R4C3'],
  ['R1C4', 'R2C5', 'R2C6', 'R1C7'],
  ['R3C6', 'R4C6', 'R3C5', 'R4C5', 'R3C4', 'R4C4'],
  ['R1C8', 'R2C8', 'R3C7', 'R3C8'],
  ['R3C9', 'R4C8'],
  ['R4C7', 'R5C7', 'R5C8'],
  ['R5C9', 'R6C8', 'R6C9', 'R7C9', 'R8C9'],
  ['R7C5', 'R8C5', 'R9C6'],
  ['R9C4', 'R8C4', 'R9C5'],
  ['R7C3', 'R7C4', 'R6C4'],
  ['R8C3', 'R9C2', 'R8C1'],
  ['R6C1', 'R7C2', 'R6C3'],
  ['R5C1', 'R5C2', 'R5C3', 'R5C4'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
