// Title: Oct. 7, 2022: Sum or Greater?
// Author: clover!
// Video: https://www.youtube.com/watch?v=duoeYgKmwIo
// Source: https://tinyurl.com/mjr838js

// Normal Sudoku rules apply. Each white-circle label is either the sum of its
// two digits or their greater digit. The givens and circle pairs below are
// transcribed from the drawn grid.
const givens = [
  ['R3C1', 8], ['R3C9', 4], ['R5C1', 7], ['R5C9', 3],
  ['R7C1', 6], ['R7C9', 2], ['R9C1', 5], ['R9C9', 1],
];

const circles = [
  [3, 'R1C2', 'R1C3'], [4, 'R1C4', 'R1C3'], [5, 'R1C4', 'R1C5'],
  [6, 'R1C5', 'R1C6'], [7, 'R1C6', 'R1C7'], [8, 'R1C7', 'R1C8'],
  [9, 'R1C8', 'R1C9'], [9, 'R2C9', 'R3C9'], [9, 'R5C9', 'R4C9'],
  [9, 'R6C9', 'R7C9'], [9, 'R9C9', 'R8C9'], [2, 'R1C1', 'R1C2'],
  [9, 'R3C1', 'R2C1'], [9, 'R4C1', 'R5C1'], [9, 'R6C1', 'R7C1'],
  [9, 'R8C1', 'R9C1'], [2, 'R3C6', 'R3C7'], [3, 'R3C5', 'R3C6'],
  [3, 'R4C3', 'R4C4'], [4, 'R4C5', 'R4C4'], [2, 'R5C5', 'R5C6'],
  [4, 'R5C6', 'R5C7'], [6, 'R6C4', 'R6C5'], [5, 'R6C3', 'R6C4'],
  [4, 'R7C5', 'R7C6'], [5, 'R7C7', 'R7C6'], [3, 'R9C2', 'R9C3'],
  [8, 'R9C4', 'R9C5'], [8, 'R9C6', 'R9C5'], [8, 'R9C4', 'R9C3'],
  [9, 'R9C7', 'R9C6'], [9, 'R9C8', 'R9C7'], [8, 'R9C1', 'R9C2'],
  [8, 'R9C8', 'R9C9'],
];

const circleKey = label => Pair.fnToKey(
  (a, b) => a + b === label || Math.max(a, b) === label, 9);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...circles.map(([label, a, b]) =>
    new Pair(circleKey(label), `sum or greater ${label}`, a, b)),
];
