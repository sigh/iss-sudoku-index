// Title: Oct. 22, 2022: Either/Or
// Author: clover!
// Video: https://www.youtube.com/watch?v=j-60lxKeWJI
// Source: https://tinyurl.com/npamysvs

// Normal Sudoku rules apply. Each white circle's digit must appear in at least
// one of its two adjacent cells. Each Or represents those two equal-digit
// alternatives; circle positions and digits are transcribed from the white
// circle clues in the grid.
const circles = [
  [1, 'R1C2', 'R1C1'], [2, 'R1C2', 'R1C3'], [3, 'R1C3', 'R1C4'],
  [4, 'R1C5', 'R1C4'], [5, 'R1C6', 'R1C5'], [6, 'R1C6', 'R1C7'],
  [7, 'R1C7', 'R1C8'], [8, 'R1C8', 'R1C9'], [1, 'R9C1', 'R9C2'],
  [2, 'R9C3', 'R9C2'], [3, 'R9C4', 'R9C3'], [4, 'R9C4', 'R9C5'],
  [5, 'R9C6', 'R9C5'], [6, 'R9C7', 'R9C6'], [7, 'R9C7', 'R9C8'],
  [8, 'R9C9', 'R9C8'], [3, 'R3C3', 'R3C2'], [9, 'R3C8', 'R3C9'],
  [6, 'R3C5', 'R3C6'], [4, 'R3C1', 'R3C2'], [7, 'R3C4', 'R3C5'],
  [1, 'R3C7', 'R3C8'], [5, 'R7C3', 'R7C4'], [6, 'R7C2', 'R7C3'],
  [6, 'R5C2', 'R5C3'], [4, 'R5C1', 'R5C2'], [4, 'R7C6', 'R7C7'],
  [3, 'R7C8', 'R7C7'], [3, 'R5C7', 'R5C8'], [7, 'R5C9', 'R5C8'],
  [7, 'R7C4', 'R7C5'], [1, 'R7C6', 'R7C5'], [3, 'R5C5', 'R4C5'],
  [8, 'R6C5', 'R5C5'], [9, 'R5C5', 'R5C6'], [2, 'R5C4', 'R5C5'],
];

const circleConstraints = circles.map(([digit, first, second]) => new Or([
  new Given(first, digit),
  new Given(second, digit),
]));

return [
  new Shape('9x9'),
  ...circleConstraints,
];
