// Title: All Natural Processes
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=j-60lxKeWJI
// Source: https://tinyurl.com/yactmtx3

// Normal Sudoku rules apply. Corresponding cells in each pair of same-coloured
// 3x3 regions have equal digits. The arrays transcribe the two drawn region pairs
// in row-major order, so each SameValues pair preserves its drawn position.
const yellowUpper = ['R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'];
const yellowLower = ['R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'];
const greenUpper = ['R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'];
const greenLower = ['R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'];

const clonePairs = [
  ...yellowUpper.map((cell, i) => new SameValues(2, cell, yellowLower[i])),
  ...greenUpper.map((cell, i) => new SameValues(2, cell, greenLower[i])),
];

return [
  new Shape('9x9'),
  // Givens transcribed from the puzzle grid.
  new Given('R2C2', 2), new Given('R2C3', 3), new Given('R2C4', 4),
  new Given('R2C7', 5), new Given('R2C8', 9), new Given('R3C2', 1),
  new Given('R3C8', 7), new Given('R4C8', 2), new Given('R6C2', 6),
  new Given('R7C2', 9), new Given('R7C8', 5), new Given('R8C2', 3),
  new Given('R8C3', 1), new Given('R8C6', 8), new Given('R8C7', 7),
  new Given('R8C8', 6),
  ...clonePairs,
];
