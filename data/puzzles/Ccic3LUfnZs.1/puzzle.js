// Title: July 26, 2021: Consec-Pairrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=Ccic3LUfnZs
// Source: https://tinyurl.com/3ydkdrvv

// Normal sudoku rules apply. Digits along an arrow sum to the digit in the
// adjoining circle. Digits joined by a white dot must be consecutive. The
// rules state not all white dots are given, so the drawn dots are the only
// ones enforced (no exhaustive negative constraint on undrawn pairs).

const arrows = [
  ['R1C3', 'R1C2', 'R1C1'],
  ['R1C6', 'R1C5', 'R1C4'],
  ['R6C1', 'R5C1', 'R4C1', 'R3C1'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R9C9', 'R8C9', 'R7C9'],
  ['R3C2', 'R4C2', 'R4C3'],
  ['R7C8', 'R6C8', 'R6C7'],
  ['R5C9', 'R5C8', 'R5C7'],
  ['R5C2', 'R5C3', 'R5C4'],
];

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R1C2', 'R1C3'],
  ['R1C3', 'R1C4'],
  ['R1C4', 'R1C5'],
  ['R1C6', 'R1C7'],
  ['R1C7', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R4C1', 'R5C1'],
  ['R3C1', 'R4C1'],
  ['R2C1', 'R3C1'],
  ['R2C9', 'R3C9'],
  ['R3C9', 'R4C9'],
  ['R6C1', 'R7C1'],
  ['R7C1', 'R8C1'],
  ['R8C1', 'R9C1'],
  ['R9C2', 'R9C3'],
  ['R9C3', 'R9C4'],
  ['R9C4', 'R9C5'],
  ['R9C5', 'R9C6'],
  ['R9C7', 'R9C8'],
  ['R9C8', 'R9C9'],
  ['R7C9', 'R8C9'],
  ['R8C8', 'R8C9'],
  ['R8C7', 'R8C8'],
  ['R8C6', 'R8C7'],
  ['R2C1', 'R2C2'],
  ['R2C2', 'R2C3'],
  ['R2C3', 'R2C4'],
  ['R4C2', 'R4C3'],
  ['R6C6', 'R6C7'],
];

return [
  new Shape('9x9'),
  ...arrows.map((cells) => new Arrow(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
];
