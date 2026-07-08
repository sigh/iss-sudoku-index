// Title: Good and Plenty
// Author: Blobz
// Video: https://www.youtube.com/watch?v=t7cZjAyU50s
// Source: https://sudokupad.app/blobz/good-and-plenty

// Normal sudoku. Anti-knight. Digits in circles appear in cells touching the
// circle. Digits joined by pink lines are consecutive.

const consecutive = Pair.fnToKey((a, b) => Math.abs(a - b) === 1, 9);

const pinkLines = [
  ['R5C6', 'R5C7'],
  ['R4C3', 'R5C3'],
  ['R7C7', 'R7C8'],
  ['R2C5', 'R3C4'],
  ['R8C1', 'R9C1'],
  ['R2C1', 'R2C2'],
  ['R2C7', 'R3C7'],
  ['R4C8', 'R5C8'],
  ['R4C5', 'R5C4'],
  ['R6C1', 'R6C2'],
  ['R8C5', 'R9C5'],
  ['R1C8', 'R2C8'],
];

return [
  new AntiKnight(),
  new Quad('R1C1', 1, 2, 4),
  new Quad('R1C8', 1, 2, 3),
  new Quad('R8C8', 1, 2, 4),
  new Quad('R8C1', 1, 2, 3),
  ...pinkLines.map(cells => new Pair(consecutive, 'consecutive', ...cells)),
];
