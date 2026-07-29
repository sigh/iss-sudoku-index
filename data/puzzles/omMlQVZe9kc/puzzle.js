// Title: Overlap
// Author: blackjackfitz
// Video: https://www.youtube.com/watch?v=omMlQVZe9kc
// Source: https://sudokupad.app/T3ttPM3pH8

// Standard Sudoku with both non-repeating diagonals, five givens, and the
// purple Renban strokes. Touching strokes remain separate clues.
const lines = [
  ['R9C1', 'R8C1', 'R8C2'], ['R9C1', 'R9C2', 'R8C2'],
  ['R2C8', 'R1C8', 'R1C9'], ['R1C9', 'R2C9', 'R2C8'],
  ['R2C2', 'R1C2', 'R1C1'], ['R2C2', 'R2C1', 'R1C1'],
  ['R8C8', 'R9C8', 'R9C9'], ['R9C9', 'R8C9', 'R8C8'],
  ['R3C4', 'R3C3', 'R4C3', 'R5C3', 'R6C3'],
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6'],
  ['R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7'],
  ['R4C7', 'R3C7', 'R3C6', 'R3C5', 'R3C4'],
];

return [
  new Shape('9x9'),
  new Given('R2C5', 1), new Given('R5C1', 3), new Given('R5C5', 5),
  new Given('R5C8', 4), new Given('R9C5', 7),
  new Diagonal(1), new Diagonal(-1),
  ...lines.map(cells => new Renban(...cells)),
];
