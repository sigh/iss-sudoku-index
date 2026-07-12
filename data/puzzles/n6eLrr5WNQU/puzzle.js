// Title: Catacomb
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=n6eLrr5WNQU
// Source: https://sudokupad.app/swwi1ob4u3

// Normal sudoku rules apply. There are no given digits.
//
// The 3x3 box borders divide each blue line into segments; the segments
// along an individual line must each have the same sum. This is exactly
// RegionSumLine: equal sums per box-bounded segment of the line, allowing a
// line to pass through the same box more than once with separate segments.
//
// Blue line cell paths were recovered from the drawn waypoints (diagonal
// steps interpolated to the intervening cell). None of the eight lines are
// drawn closed.
const lines = [
  ['R5C6', 'R4C5', 'R3C4', 'R4C3', 'R5C4', 'R6C5', 'R7C6', 'R8C7', 'R7C8', 'R6C9', 'R5C8'],
  ['R5C5', 'R6C6', 'R7C7', 'R6C8', 'R5C7', 'R4C6'],
  ['R4C7', 'R3C6', 'R2C5', 'R2C4', 'R3C3', 'R4C2', 'R5C2', 'R6C3', 'R7C4'],
  ['R2C8', 'R3C8', 'R4C8', 'R5C9'],
  ['R1C9', 'R1C8', 'R1C7', 'R2C7', 'R3C7', 'R2C6', 'R1C5', 'R1C6'],
  ['R9C1', 'R9C2', 'R9C3', 'R8C3', 'R7C3', 'R8C4', 'R7C5', 'R8C6'],
  ['R6C1', 'R7C1', 'R8C1'],
  ['R8C2', 'R7C2', 'R6C2', 'R5C1'],
];

const constraints = [new Shape('9x9')];
for (const cells of lines) constraints.push(new RegionSumLine(...cells));

return constraints;
