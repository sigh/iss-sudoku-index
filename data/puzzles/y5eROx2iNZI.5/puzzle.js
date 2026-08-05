// Title: 10/10/22:Difference or Greater
// Author: clover!
// Video: https://www.youtube.com/watch?v=y5eROx2iNZI
// Source: https://tinyurl.com/34257e39

// Normal Sudoku rules and the fourteen given digits apply.
// Each drawn white circle has the stated number as either the two digits'
// absolute difference or their greater digit. The pairs below are transcribed
// from the 32 labelled circles in the source payload.
const givens = [
  ['R2C2', 1], ['R2C8', 2], ['R3C5', 4], ['R3C6', 8], ['R4C3', 2],
  ['R4C7', 4], ['R5C3', 3], ['R5C7', 2], ['R6C3', 4], ['R6C7', 3],
  ['R7C4', 4], ['R7C5', 1], ['R8C2', 2], ['R8C8', 1],
];

const circles = [
  [2, 'R4C4', 'R4C3'], [3, 'R5C4', 'R5C3'], [4, 'R6C3', 'R6C4'],
  [2, 'R5C6', 'R5C7'], [3, 'R6C6', 'R6C7'], [4, 'R4C6', 'R4C7'],
  [3, 'R6C6', 'R7C6'], [5, 'R4C4', 'R3C4'], [5, 'R7C8', 'R8C8'],
  [6, 'R8C7', 'R8C8'], [7, 'R9C8', 'R8C8'], [4, 'R8C8', 'R8C9'],
  [5, 'R3C2', 'R2C2'], [4, 'R2C1', 'R2C2'], [7, 'R2C2', 'R2C3'],
  [6, 'R1C2', 'R2C2'], [4, 'R2C7', 'R2C8'], [4, 'R1C8', 'R2C8'],
  [3, 'R2C8', 'R3C8'], [3, 'R2C8', 'R2C9'], [4, 'R8C3', 'R8C2'],
  [4, 'R8C2', 'R9C2'], [3, 'R7C2', 'R8C2'], [3, 'R8C1', 'R8C2'],
  [5, 'R3C5', 'R3C4'], [5, 'R7C5', 'R7C6'], [8, 'R5C9', 'R6C9'],
  [8, 'R4C9', 'R5C9'], [6, 'R5C1', 'R4C1'], [6, 'R6C1', 'R5C1'],
  [9, 'R5C2', 'R4C2'], [9, 'R5C8', 'R6C8'],
];

const circleConstraints = circles.map(([label, a, b]) => {
  // The Pair key is the truth table for this label's two allowed readings.
  const key = Pair.fnToKey((x, y) => Math.abs(x - y) === label || Math.max(x, y) === label, 9);
  return new Pair(key, `circle ${label}`, a, b);
});

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...circleConstraints,
];
