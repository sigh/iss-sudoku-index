// Title: Lest We Forget
// Author: Sudoku Joker
// Video: https://www.youtube.com/watch?v=5nLEZK8Rlys
// Source: https://sudokupad.app/qkmbbu7yux

// Normal Sudoku, two quadruples, black Kropki dots, green German-whisper
// lines, and the seven-cell grey-cross renban. The tiny green R9C6 stroke has
// no adjacent cells and therefore adds no pairwise whisper condition.
const blackDots = [
  ['R2C2', 'R3C2'], ['R7C8', 'R8C8'], ['R1C6', 'R2C6'],
  ['R5C3', 'R6C3'], ['R7C2', 'R8C2'], ['R4C7', 'R5C7'],
  ['R7C4', 'R8C4'], ['R1C3', 'R2C3'], ['R1C8', 'R2C8'],
  ['R8C6', 'R9C6'],
];

const whispers = [
  ['R3C2', 'R4C2'], ['R2C3', 'R3C3'], ['R2C6', 'R3C6'],
  ['R3C8', 'R2C8'], ['R5C7', 'R6C7'], ['R8C8', 'R9C8'],
  ['R8C4', 'R9C4'], ['R8C2', 'R9C2'], ['R6C3', 'R7C3'],
];

return [
  new Shape('9x9'),
  new Quad('R3C3', 1, 9, 1, 4),
  new Quad('R6C6', 1, 9, 1, 8),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  ...whispers.map(cells => new Whisper(5, ...cells)),
  new Renban('R5C4', 'R5C5', 'R5C6', 'R4C5', 'R6C5', 'R7C5', 'R8C5'),
];
