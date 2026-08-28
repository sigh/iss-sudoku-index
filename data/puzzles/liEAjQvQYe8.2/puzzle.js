// Title: 4/29: Lampropeltis holbrooki
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=liEAjQvQYe8
// Source: https://tinyurl.com/3crsw4hp

// Normal sudoku, no givens. White dots mark consecutive pairs (difference of
// 1); black dots mark 2:1 ratio pairs. No negative constraint: unmarked pairs
// may also happen to be consecutive or 2:1.

const whiteDots = [
  ['R5C6', 'R6C6'],
  ['R6C5', 'R6C4'],
  ['R6C4', 'R5C4'],
  ['R4C4', 'R5C4'],
  ['R5C1', 'R6C1'],
  ['R4C2', 'R4C1'],
  ['R4C2', 'R4C3'],
  ['R5C3', 'R4C3'],
  ['R4C9', 'R4C8'],
  ['R5C7', 'R5C8'],
  ['R6C7', 'R5C7'],
  ['R6C7', 'R6C8'],
  ['R3C5', 'R3C4'],
  ['R3C6', 'R2C6'],
  ['R2C5', 'R2C6'],
  ['R1C5', 'R2C5'],
  ['R8C4', 'R8C5'],
  ['R7C5', 'R7C4'],
  ['R7C6', 'R7C5'],
  ['R7C6', 'R8C6'],
  ['R2C7', 'R2C8'],
  ['R1C8', 'R1C7'],
  ['R1C9', 'R1C8'],
  ['R1C9', 'R2C9'],
  ['R8C1', 'R9C1'],
];

const blackDots = [
  ['R4C6', 'R4C5'],
  ['R5C6', 'R4C6'],
  ['R6C5', 'R6C6'],
  ['R6C2', 'R5C2'],
  ['R6C1', 'R6C2'],
  ['R4C1', 'R5C1'],
  ['R5C9', 'R6C9'],
  ['R4C9', 'R5C9'],
  ['R5C8', 'R4C8'],
  ['R1C4', 'R2C4'],
  ['R2C4', 'R3C4'],
  ['R3C6', 'R3C5'],
  ['R9C6', 'R9C5'],
  ['R8C5', 'R9C5'],
  ['R7C4', 'R8C4'],
  ['R3C7', 'R3C8'],
  ['R3C8', 'R2C8'],
  ['R1C7', 'R2C7'],
  ['R8C2', 'R9C2'],
];

return [
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
