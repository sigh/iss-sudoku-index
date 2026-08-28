// Title: Tatwotween
// Author: Mystery Setter #2
// Video: https://www.youtube.com/watch?v=CcM3kud1pvU
// Source: https://tinyurl.com/yj72w4yp

// Normal Sudoku. Killer cages: digits do not repeat within a cage and sum to
// the printed total. Between lines: every digit on the line is strictly
// between the values in the circles at its two ends.

const givens = [
  ['R3C3', 3], ['R4C4', 7], ['R7C7', 2], ['R8C6', 8], ['R9C5', 3],
];

// Cages transcribed from the drawn dashed outlines and their printed totals.
const cages = [
  [14, 'R3C5', 'R4C5'],
  [6, 'R3C8', 'R4C8'],
  [13, 'R3C2', 'R4C2'],
  [11, 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  [11, 'R2C3', 'R2C4'],
  [13, 'R5C3', 'R5C4'],
  [19, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  [24, 'R7C9', 'R8C8', 'R8C9'],
  [6, 'R8C2', 'R9C1', 'R9C2'],
  [9, 'R7C3', 'R7C4'],
  [11, 'R9C6', 'R9C7'],
];

// Paths transcribed from the circular-ended lines, in their drawn order;
// first and last cell of each are the circled endpoints.
const betweenLines = [
  ['R9C1', 'R8C2', 'R7C3', 'R7C4', 'R8C5', 'R9C6', 'R9C7', 'R8C8', 'R7C9'],
  ['R3C2', 'R2C3', 'R2C4', 'R3C5', 'R4C5', 'R5C4', 'R5C3', 'R4C2'],
  ['R2C9', 'R3C8', 'R4C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
];
