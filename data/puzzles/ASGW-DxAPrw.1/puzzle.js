// Title: 10/19/2023: Free Range Killer
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ASGW-DxAPrw
// Source: https://tinyurl.com/rnxzn6ty

// Normal Sudoku rules apply. Each corner circle gives the sum of its four
// surrounding cells; the rule explicitly permits repeats within a circle.
// The given table and circle table are transcribed from the drawn puzzle data.
const givens = [
  ['R2C8', 1], ['R2C9', 4], ['R3C1', 6], ['R5C5', 6],
  ['R7C9', 2], ['R8C1', 3], ['R8C2', 4], ['R8C9', 6],
];
const circles = [
  [6, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  [34, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [14, 'R3C6', 'R3C7', 'R4C6', 'R4C7'],
  [26, 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
  [26, 'R2C4', 'R2C5', 'R3C4', 'R3C5'],
  [14, 'R7C5', 'R7C6', 'R8C5', 'R8C6'],
  [26, 'R4C7', 'R4C8', 'R5C7', 'R5C8'],
  [14, 'R5C2', 'R5C3', 'R6C2', 'R6C3'],
  [14, 'R4C2', 'R4C3', 'R5C2', 'R5C3'],
  [26, 'R5C7', 'R5C8', 'R6C7', 'R6C8'],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...circles.map(([sum, ...cells]) => new Sum(sum, ...cells)),
];
