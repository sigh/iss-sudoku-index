// Title: Hunt the Prime
// Author: Asheros
// Video: https://www.youtube.com/watch?v=WamrJ_Kju74
// Source: https://sudokupad.app/47mfkmst0b

// Highlighted cells contain only prime digits.
const primeCells = [
  'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C8',
  'R6C7', 'R7C6', 'R8C5', 'R9C4', 'R8C3',
  'R7C2', 'R6C1', 'R5C2', 'R4C3', 'R3C4',
  'R2C5', 'R4C4', 'R4C6', 'R6C6', 'R6C4',
];
const primeRestrictions = primeCells.map(cell => new Given(cell, 2, 3, 5, 7));

// Each arm is listed from its circle outwards.
const arrows = [
  new Arrow('R4C2', 'R3C3', 'R2C2'),
  new Arrow('R4C2', 'R4C3', 'R5C2', 'R4C1'),
  new Arrow('R4C2', 'R4C3', 'R5C4'),
  new Arrow('R3C6', 'R4C5', 'R4C4'),
  new Arrow('R3C6', 'R2C6', 'R2C5', 'R2C4'),
  new Arrow('R3C6', 'R3C7', 'R3C8'),
  new Arrow('R1C9', 'R2C9', 'R1C8'),
  new Arrow('R7C7', 'R7C8', 'R6C9'),
  new Arrow('R8C3', 'R9C3', 'R9C4', 'R9C5', 'R8C6'),
  new Arrow('R8C3', 'R8C2', 'R7C2'),
  new Arrow('R8C3', 'R7C3', 'R6C2'),
];

return [
  new Shape('9x9'),
  ...primeRestrictions,
  ...arrows,
];
