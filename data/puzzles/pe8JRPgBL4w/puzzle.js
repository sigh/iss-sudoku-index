// Title: Par-King at the Garage
// Author: olima
// Video: https://www.youtube.com/watch?v=pe8JRPgBL4w
// Source: https://sudokupad.app/cy362icfvw

// Normal sudoku and anti-king rules apply. Adjacent digits on each green
// line differ by at least 5. The box-delimited segments of each blue line
// have equal sums. Every listed circle digit occurs among the four cells
// touching that circle.
const GREEN_LINES = [
  ['R7C4', 'R7C3', 'R7C2', 'R6C2', 'R6C3', 'R6C4', 'R5C5'],
  ['R6C3', 'R5C4', 'R4C5', 'R4C6', 'R4C7', 'R5C8', 'R6C9', 'R7C9', 'R7C8'],
  ['R4C6', 'R5C6', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R5C8', 'R5C7'],
  ['R6C6', 'R7C6'],
];

const BLUE_LINES = [
  ['R9C5', 'R8C6', 'R8C7', 'R9C8'],
  ['R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1', 'R3C1', 'R3C2'],
  ['R9C4', 'R8C3', 'R8C2', 'R9C1'],
];

return [
  new Shape('9x9'),
  new AntiKing(),

  ...GREEN_LINES.map((cells) => new Whisper(5, ...cells)),
  ...BLUE_LINES.map((cells) => new RegionSumLine(...cells)),

  new Quad('R7C3', 1, 2, 3),
  new Quad('R7C7', 5, 6, 7),
];
