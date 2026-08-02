// Title: Double Arrows
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=QA9DtFtFFy8
// Source: https://sudokupad.app/m64296ezsf

// Normal Sudoku, anti-king, and ten arrows. Each listed arm sums to its circle.
const arrows = [
  ['R5C3', 'R4C4', 'R3C5'], ['R5C3', 'R6C2', 'R7C1'],
  ['R5C4', 'R4C5', 'R3C6'], ['R5C4', 'R6C3', 'R7C2'],
  ['R5C5', 'R4C6', 'R3C7'], ['R5C5', 'R6C4', 'R7C3'],
  ['R5C6', 'R4C7', 'R3C8'], ['R5C6', 'R6C5', 'R7C4'],
  ['R5C7', 'R4C8', 'R3C9'], ['R5C7', 'R6C6', 'R7C5'],
];

return [
  new Shape('9x9'),
  new Given('R6C4', 4), new Given('R6C5', 3), new Given('R6C6', 5),
  new Given('R9C2', 8), new Given('R9C8', 5),
  new AntiKing(),
  ...arrows.map(cells => new Arrow(...cells)),
];
