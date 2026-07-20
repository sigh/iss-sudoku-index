// Title: Sum assembly required.
// Author: Jonesy
// Video: https://www.youtube.com/watch?v=2tN5-TTuEjE
// Source: https://sudokupad.app/4i0mviwdne

// A cage total is either the two digits in its designated label cells, or 11
// times the first label digit when the total has two identical digits.
const assembledTotal = (cells, tens, ones) => new Or([
  new Sum(0, ...cells, [tens, -10], [ones, -1]),
  new Sum(0, ...cells, [tens, -11]),
]);

const assembledCages = [
  assembledTotal(['R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C3'], 'R1C1', 'R1C2'),
  assembledTotal(['R2C1', 'R2C2', 'R3C1', 'R3C2'], 'R2C1', 'R2C2'),
  assembledTotal(['R1C4', 'R2C4', 'R2C5'], 'R1C4', 'R2C4'),
  assembledTotal(['R1C5', 'R1C6', 'R2C6', 'R3C4', 'R3C5', 'R3C6'], 'R1C5', 'R1C6'),
  assembledTotal([
    'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9',
    'R3C7', 'R3C8', 'R3C9', 'R4C7',
  ], 'R1C7', 'R1C8'),
  assembledTotal([
    'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C7', 'R6C8', 'R6C9',
  ], 'R4C8', 'R4C9'),
  assembledTotal(['R4C5', 'R4C6', 'R5C5', 'R5C6', 'R6C6'], 'R4C5', 'R4C6'),
  assembledTotal([
    'R4C1', 'R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2',
    'R5C3', 'R5C4', 'R6C1', 'R6C2', 'R6C3',
  ], 'R4C1', 'R4C2'),
  assembledTotal(['R7C6', 'R8C6', 'R9C6'], 'R7C6', 'R8C6'),
  assembledTotal(['R7C5', 'R8C3', 'R8C4', 'R8C5', 'R9C4', 'R9C5'], 'R7C5', 'R8C5'),
  assembledTotal(['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R9C7', 'R9C8', 'R9C9'], 'R7C7', 'R7C8'),
];

const arrows = [
  new Arrow('R2C5', 'R2C6', 'R3C6'),
  new Arrow('R3C3', 'R3C2', 'R3C1'),
  new Arrow('R6C5', 'R6C6', 'R5C6'),
  new Arrow('R6C4', 'R7C4', 'R8C4'),
  new Arrow('R7C1', 'R8C2', 'R9C2', 'R9C3'),
  new Arrow('R2C7', 'R2C8', 'R3C8'),
  new Arrow('R8C7', 'R8C8', 'R8C9'),
  new Arrow('R6C1', 'R6C2', 'R6C3'),
];

return [
  new Shape('9x9'),
  ...assembledCages,
  ...arrows,
];
