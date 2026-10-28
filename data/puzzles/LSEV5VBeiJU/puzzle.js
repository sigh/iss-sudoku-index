// Title: Knight at the Community Centre
// Author: xMcacutt
// Video: https://www.youtube.com/watch?v=LSEV5VBeiJU
// Source: https://sudokupad.app/dcnwx0ynsi

// Normal Sudoku, anti-knight, arrow sums, and equal digits in same-colour circles.
// The drawn arrow shafts, listed bulb first.
const arrows = [
  ['R2C8', 'R3C7', 'R4C6'],
  ['R8C2', 'R9C3', 'R9C4'],
  ['R2C5', 'R1C6', 'R1C7', 'R1C8'],
  ['R5C8', 'R4C8', 'R5C7', 'R6C6', 'R6C5'],
  ['R5C2', 'R4C2', 'R3C3', 'R2C3'],
  ['R8C5', 'R8C6', 'R9C7'],
];
// The red, green, and blue pairs of drawn circles, respectively.
const circlePairs = [
  ['R2C8', 'R8C2'],
  ['R2C5', 'R5C8'],
  ['R5C2', 'R8C5'],
];
return [
  new Shape('9x9'),
  new AntiKnight(),
  ...arrows.map(cells => new Arrow(...cells)),
  ...circlePairs.map(cells => new SameValues(2, ...cells)),
];
