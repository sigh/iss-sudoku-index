// Title: Major Diagonals Speed Run
// Author: Will Power
// Video: https://www.youtube.com/watch?v=ucGMY8x4s0Q
// Source: https://sudokupad.app/jBfHFQHHp9

// Standard 9x9 Sudoku rules apply. Both major diagonals are all-different.
// White dots are consecutive pairs; black dots are 2:1-ratio pairs.
// Dot coordinates are transcribed from the white and black edge marks.
const whiteDots = [
  ['R4C5', 'R5C5'], ['R5C5', 'R6C5'], ['R6C3', 'R7C3'],
  ['R7C3', 'R8C3'], ['R6C1', 'R6C2'], ['R6C1', 'R7C1'],
  ['R2C2', 'R2C3'], ['R1C3', 'R2C3'], ['R2C2', 'R3C2'],
  ['R1C5', 'R2C5'], ['R1C5', 'R1C6'], ['R8C4', 'R8C5'],
  ['R8C4', 'R9C4'], ['R7C6', 'R8C6'], ['R8C6', 'R9C6'],
  ['R4C8', 'R5C8'], ['R4C8', 'R4C9'], ['R5C2', 'R5C3'],
  ['R4C3', 'R5C3'],
];

const blackDots = [
  ['R5C4', 'R5C5'], ['R5C5', 'R5C6'], ['R5C6', 'R5C7'],
  ['R3C6', 'R3C7'], ['R3C5', 'R3C6'], ['R3C4', 'R3C5'],
  ['R7C4', 'R7C5'], ['R7C3', 'R7C4'], ['R7C2', 'R7C3'],
  ['R8C9', 'R9C9'], ['R9C8', 'R9C9'], ['R8C8', 'R8C9'],
  ['R6C7', 'R7C7'], ['R1C8', 'R1C9'], ['R4C4', 'R4C5'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
