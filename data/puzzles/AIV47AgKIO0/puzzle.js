// Title: Basket
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=AIV47AgKIO0
// Source: https://sudokupad.app/3d513yr35u

// Rules encoded: normal 9x9 Sudoku with standard boxes; both marked diagonals
// contain no repeated digit; every drawn line is a renban; X pairs sum to 10;
// V pairs sum to 5. The rules do not specify a negative XV constraint.

// The seven drawn renban paths, transcribed in path order.
const renbanLines = [
  ['R1C4', 'R1C3', 'R1C2', 'R2C1', 'R3C1', 'R3C2', 'R2C3'],
  ['R4C9', 'R3C9', 'R2C9', 'R1C8', 'R1C7', 'R2C7', 'R3C8'],
  ['R9C6', 'R9C7', 'R9C8', 'R8C9', 'R7C9', 'R7C8', 'R8C7'],
  ['R6C1', 'R7C1', 'R8C1', 'R9C2', 'R9C3', 'R8C3', 'R7C2'],
  ['R3C6', 'R4C5', 'R5C4', 'R6C3'],
  ['R8C4', 'R7C5', 'R8C6'],
  ['R6C7', 'R6C8', 'R5C8', 'R4C7'],
];

// The two drawn X marks and two drawn V marks.
const xPairs = [
  ['R1C6', 'R1C5'],
  ['R9C4', 'R9C5'],
];
const vPairs = [
  ['R4C1', 'R5C1'],
  ['R5C9', 'R6C9'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...renbanLines.map((cells) => new Renban(...cells)),
  ...xPairs.map((cells) => new X(...cells)),
  ...vPairs.map((cells) => new V(...cells)),
];
