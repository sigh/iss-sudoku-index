// Title: Dot.Com Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=duoeYgKmwIo
// Source: https://tinyurl.com/2px3ujhs

// Normal Sudoku rules apply. Each plus joins diagonals of equal sum; each minus
// joins diagonals of equal absolute difference. Not all possible marks are shown.
// The lists below transcribe the drawn 2x2 intersections as [top-left, top-right,
// bottom-left, bottom-right].
const pluses = [
  ['R2C1', 'R2C2', 'R3C1', 'R3C2'],
  ['R1C2', 'R1C3', 'R2C2', 'R2C3'],
  ['R5C5', 'R5C6', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R6C4', 'R6C5'],
  ['R7C8', 'R7C9', 'R8C8', 'R8C9'],
  ['R8C7', 'R8C8', 'R9C7', 'R9C8'],
  ['R3C6', 'R3C7', 'R4C6', 'R4C7'],
  ['R2C7', 'R2C8', 'R3C7', 'R3C8'],
  ['R6C3', 'R6C4', 'R7C3', 'R7C4'],
  ['R7C2', 'R7C3', 'R8C2', 'R8C3'],
];

const signs = ['+', '-', '+', '-', '-', '+', '-', '+', '+', '-'];

const equalDifference = (a, b, c, d) => new Or([
  // The two absolute differences agree in either orientation.
  new EqualSum([a, c], [b, d]),
  new EqualSum([a, b], [c, d]),
]);

const marks = pluses.map(([a, b, c, d], i) => signs[i] === '+'
  ? new EqualSum([a, d], [b, c])
  : equalDifference(a, b, c, d));

return [
  new Shape('9x9'),
  // Givens transcribed from the grid.
  new Given('R1C2', 1),
  new Given('R2C1', 7), new Given('R2C3', 4), new Given('R2C5', 5), new Given('R2C8', 3),
  new Given('R3C2', 8), new Given('R3C6', 6),
  new Given('R4C5', 2), new Given('R4C7', 5),
  new Given('R5C4', 6), new Given('R5C6', 3),
  new Given('R6C3', 6), new Given('R6C5', 9),
  new Given('R7C4', 9), new Given('R7C8', 7),
  new Given('R8C2', 9), new Given('R8C5', 8), new Given('R8C7', 6), new Given('R8C9', 3),
  new Given('R9C8', 8),
  ...marks,
];
