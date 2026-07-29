// Title: This + This = That
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=gmFFnXktWbo
// Source: https://sudokupad.app/hm38DDftrd

// Normal Sudoku rules apply. Arrow circles equal the sum of their shaft digits.
// White dots join consecutive digits; black dots join digits in a 1:2 ratio.
// The rules state that not all dots are given, so no negative-dot rule is added.
const arrows = [
  ['R1C3', 'R2C4', 'R3C4'],
  ['R1C7', 'R2C6', 'R3C6'],
  ['R3C9', 'R4C8', 'R4C7'],
  ['R7C9', 'R6C8', 'R6C7'],
  ['R9C7', 'R8C6', 'R7C6'],
  ['R9C3', 'R8C4', 'R7C4'],
  ['R7C1', 'R6C2', 'R6C3'],
  ['R3C1', 'R4C2', 'R4C3'],
];

// Drawn white-dot dominoes.
const whiteDots = [
  ['R6C1', 'R7C1'], ['R5C2', 'R5C3'], ['R3C3', 'R4C3'],
  ['R1C9', 'R2C9'], ['R4C9', 'R5C9'], ['R5C7', 'R5C8'],
];

// Drawn black-dot dominoes.
const blackDots = [
  ['R1C3', 'R1C4'], ['R6C7', 'R7C7'], ['R8C9', 'R9C9'],
  ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),
  ...arrows.map((cells) => new Arrow(...cells)),
  ...whiteDots.map((cells) => new WhiteDot(...cells)),
  ...blackDots.map((cells) => new BlackDot(...cells)),
];
