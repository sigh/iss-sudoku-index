// Title: Waterfall
// Author: Salidom
// Video: https://www.youtube.com/watch?v=YzDgl24P4B8
// Source: https://sudokupad.app/uolc3f9l8q

// Normal sudoku. White dot: the two cells are consecutive. Black dot: one
// digit is double the other. Not all possible dots are given, so there is no
// negative constraint on undotted pairs. The grey square (R9C1) is even.

// Black-filled edge dots, as drawn.
const blackDots = [
  ['R2C1', 'R2C2'], ['R1C4', 'R1C5'], ['R2C6', 'R3C6'], ['R3C7', 'R3C8'],
  ['R3C8', 'R3C9'], ['R4C4', 'R5C4'], ['R8C4', 'R8C5'], ['R7C7', 'R8C7'],
  ['R9C1', 'R9C2'], ['R5C9', 'R6C9'],
];

// White-filled edge dots, as drawn.
const whiteDots = [
  ['R1C1', 'R1C2'], ['R3C1', 'R3C2'], ['R1C3', 'R2C3'], ['R2C4', 'R3C4'],
  ['R2C5', 'R3C5'], ['R1C6', 'R1C7'], ['R7C4', 'R8C4'], ['R4C6', 'R5C6'],
  ['R4C5', 'R5C5'], ['R9C6', 'R9C7'], ['R8C8', 'R9C8'], ['R8C9', 'R9C9'],
  ['R8C2', 'R8C3'], ['R5C7', 'R6C7'], ['R6C3', 'R7C3'], ['R5C1', 'R5C2'],
  ['R5C3', 'R5C4'], ['R5C2', 'R6C2'],
];

return [
  new Shape('9x9'),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  // Grey square.
  new Given('R9C1', 2, 4, 6, 8),
];
