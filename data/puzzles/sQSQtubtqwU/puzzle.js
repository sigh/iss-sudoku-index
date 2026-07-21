// Title: Co-op
// Author: Math Pesto
// Video: https://www.youtube.com/watch?v=sQSQtubtqwU
// Source: https://sudokupad.app/g6riporqv1

// Each arrow's arm sums to its circle cell.
const arrows = [
  ['R3C4', 'R3C3', 'R4C2'],
  ['R1C4', 'R1C3', 'R1C2', 'R2C1'],
  ['R2C4', 'R2C3', 'R3C2'],
  ['R3C5', 'R4C4', 'R5C4', 'R6C3'],
  ['R3C6', 'R4C6', 'R5C6', 'R6C7'],
  ['R9C6', 'R9C7', 'R9C8', 'R8C9'],
  ['R8C6', 'R8C7', 'R7C8'],
  ['R7C6', 'R7C7', 'R6C8'],
  ['R6C2', 'R7C2', 'R7C3'],
  ['R9C4', 'R9C3', 'R8C2'],
  ['R2C6', 'R3C7', 'R4C8'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
];
