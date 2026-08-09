// Title: Sept. 15, 2022: Sam I Am Not
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=tSRzvfVUpdE
// Source: https://tinyurl.com/2p953c5e
//
// Normal sudoku rules apply (standard 3x3 boxes).
// Digits along an arrow sum to the digit in the circled cell -> one
// Arrow(circle, ...arm) per arrow.
const givens = {
  R1C2: 5, R1C5: 3, R2C9: 4, R3C5: 6,
  R5C1: 4, R5C3: 7, R5C7: 9, R5C9: 5,
  R7C5: 8, R8C1: 2, R9C5: 2, R9C8: 3,
};

const arrows = [
  ['R3C2', 'R2C1', 'R1C2', 'R2C3', 'R3C4'],
  ['R2C7', 'R1C8', 'R2C9', 'R3C8', 'R4C7'],
  ['R7C8', 'R8C9', 'R9C8', 'R8C7', 'R7C6'],
  ['R8C3', 'R9C2', 'R8C1', 'R7C2', 'R6C3'],
  ['R5C3', 'R4C4'],
  ['R3C5', 'R4C6'],
  ['R5C7', 'R6C6'],
  ['R7C5', 'R6C4'],
];

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, digit]) => new Given(cell, digit)),
  ...arrows.map(cells => new Arrow(...cells)),
];
