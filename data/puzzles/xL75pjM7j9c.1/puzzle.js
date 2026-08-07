// Title: October 4, 2022: Line Sums
// Author: clover!
// Video: https://www.youtube.com/watch?v=xL75pjM7j9c
// Source: https://tinyurl.com/mryfrp8n

// Normal sudoku rules apply. On each 3-cell line, the digit in the line's
// center cell equals the sum of the digits in its two end cells. Every
// drawn line's middle cell is adjacent to both of its neighbours, so the
// middle array element is the "center position" for every line.

const givens = [
  // From `grid` values in the source payload.
  ['R1C2', 8], ['R1C8', 5],
  ['R2C1', 5], ['R2C4', 7], ['R2C6', 9], ['R2C9', 8],
  ['R4C2', 7],
  ['R5C2', 9], ['R5C8', 7],
  ['R6C8', 9],
  ['R8C1', 6], ['R8C4', 9], ['R8C6', 7], ['R8C9', 5],
  ['R9C2', 5], ['R9C8', 6],
];

// [end, center, end], from the `line` array in the source payload.
const lines = [
  ['R1C2', 'R1C3', 'R1C4'],
  ['R1C6', 'R1C7', 'R1C8'],
  ['R2C1', 'R3C1', 'R4C1'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R9C2', 'R9C3', 'R9C4'],
  ['R9C6', 'R9C7', 'R9C8'],
  ['R8C9', 'R7C9', 'R6C9'],
  ['R4C9', 'R3C9', 'R2C9'],
  ['R2C5', 'R2C4', 'R3C4'],
  ['R7C6', 'R8C6', 'R8C5'],
  ['R5C7', 'R5C8', 'R4C8'],
  ['R5C3', 'R5C2', 'R6C2'],
  ['R8C3', 'R8C4', 'R7C4'],
  ['R3C6', 'R2C6', 'R2C7'],
  ['R3C2', 'R4C2', 'R4C3'],
  ['R6C7', 'R6C8', 'R7C8'],
  ['R4C6', 'R3C7', 'R3C8'],
  ['R7C2', 'R7C3', 'R6C4'],
];

// Arrow(bulb, ...arm) enforces bulb == sum(arm); passing the center cell as
// the bulb and the two ends as the arm expresses "center = sum of the ends"
// for a 2-cell arm.
const lineSums = lines.map(([a, center, b]) => new Arrow(center, a, b));

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...lineSums,
];
