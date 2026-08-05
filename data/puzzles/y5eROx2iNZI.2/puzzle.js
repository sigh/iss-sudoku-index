// Title: Oct 13, 2022: Sum or Less
// Author: clover!
// Video: https://www.youtube.com/watch?v=y5eROx2iNZI
// Source: https://tinyurl.com/55cy9cty

// Normal Sudoku rules apply. Each listed white-circle label is either the sum
// of its two cells or their lesser digit; each circle chooses independently.
// The givens and circle data are transcribed from the puzzle grid and circles.
const givens = [
  ['R3C5', 7], ['R5C3', 8], ['R5C7', 5], ['R7C5', 6],
];
const circles = [
  ['R1C1', 'R1C2', 1], ['R1C2', 'R1C3', 2], ['R1C3', 'R1C4', 3],
  ['R1C4', 'R1C5', 4], ['R1C5', 'R1C6', 5], ['R1C6', 'R1C7', 6],
  ['R1C7', 'R1C8', 7], ['R1C8', 'R1C9', 8], ['R2C2', 'R3C2', 6],
  ['R2C7', 'R3C7', 6], ['R2C8', 'R3C8', 7], ['R2C9', 'R3C9', 8],
  ['R7C7', 'R8C7', 8], ['R9C7', 'R9C8', 1], ['R9C8', 'R9C9', 2],
  ['R7C8', 'R8C8', 7], ['R7C9', 'R8C9', 6], ['R2C3', 'R3C3', 4],
  ['R2C1', 'R3C1', 8], ['R5C7', 'R6C7', 5], ['R3C5', 'R3C6', 7],
  ['R7C4', 'R7C5', 6], ['R4C3', 'R5C3', 8], ['R9C6', 'R9C7', 9],
  ['R7C3', 'R8C3', 3], ['R7C1', 'R8C1', 7], ['R7C2', 'R8C2', 5],
  ['R9C2', 'R9C3', 6], ['R9C1', 'R9C2', 7], ['R9C3', 'R9C4', 3],
  ['R3C4', 'R3C5', 2], ['R4C7', 'R5C7', 3], ['R5C3', 'R6C3', 7],
  ['R7C5', 'R7C6', 1], ['R6C1', 'R7C1', 4], ['R3C9', 'R4C9', 4],
  ['R5C1', 'R6C1', 7], ['R4C9', 'R5C9', 5], ['R3C5', 'R4C5', 7],
  ['R6C5', 'R7C5', 6],
];

const circleConstraint = ([a, b, value]) => new Or([
  new Sum(value, a, b),
  // This custom pair branch is the alternative that the label is min(a, b).
  new Pair(Pair.fnToKey((x, y) => Math.min(x, y) === value, 9), `min ${value}`, a, b),
]);

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...circles.map(circleConstraint),
];
