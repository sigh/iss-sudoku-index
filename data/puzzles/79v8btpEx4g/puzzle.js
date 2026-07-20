// Title: Double Dippin' Dots
// Author: MathGuy_12
// Video: https://www.youtube.com/watch?v=79v8btpEx4g
// Source: https://sudokupad.app/nqdf4egrll

// A Sum Dot constrains every cell it touches; unlike a killer cage, its digits
// may repeat when the Sudoku rules allow it.
const sumDots = [
  [18, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [18, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [20, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [9, 'R2C6', 'R2C7'],
  [10, 'R5C1', 'R6C1'],
  [11, 'R4C9', 'R5C9'],
  [10, 'R9C4', 'R9C5'],
  [18, 'R3C3', 'R3C4', 'R4C3', 'R4C4'],
  [16, 'R3C4', 'R3C5', 'R4C4', 'R4C5'],
  [17, 'R3C5', 'R3C6', 'R4C5', 'R4C6'],
  [15, 'R3C6', 'R3C7', 'R4C6', 'R4C7'],
  [22, 'R4C6', 'R4C7', 'R5C6', 'R5C7'],
  [15, 'R5C6', 'R5C7', 'R6C6', 'R6C7'],
  [10, 'R6C6', 'R6C7', 'R7C6', 'R7C7'],
  [20, 'R6C5', 'R6C6', 'R7C5', 'R7C6'],
  [25, 'R6C4', 'R6C5', 'R7C4', 'R7C5'],
  [15, 'R6C3', 'R6C4', 'R7C3', 'R7C4'],
  [21, 'R5C3', 'R5C4', 'R6C3', 'R6C4'],
  [18, 'R4C3', 'R4C4', 'R5C3', 'R5C4'],
].map(([total, ...cells]) => new Sum(total, ...cells));

const sameColourCircles = [
  ['R3C3', 'R4C6'], // red
  ['R3C7', 'R6C6'], // blue
  ['R6C4', 'R7C7'], // orange
  ['R4C4', 'R7C3'], // green
].map(cells => new SameValues(cells.length, ...cells));

return [
  new Shape('9x9'),
  new Given('R5C5', 5),
  ...sumDots,
  ...sameColourCircles,
];
