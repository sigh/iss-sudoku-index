// Title: Poly
// Author: Jay Dyer
// Video: https://www.youtube.com/watch?v=K7-XsUVSYJM
// Source: https://app.crackingthecryptic.com/GM9HHd6Pqh

// Normal Sudoku rules apply. Each blue line has equal digit sums in every
// contiguous 3x3-box segment it visits; a line revisiting a box has a separate
// segment on each visit. The eight paths are transcribed from the drawn lines.
const lines = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3', 'R2C3', 'R3C4', 'R2C5'],
  ['R4C6', 'R5C6', 'R5C7', 'R4C8', 'R3C8', 'R3C9'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R5C8', 'R6C8', 'R7C8', 'R8C8', 'R9C8', 'R9C7', 'R8C6', 'R8C5', 'R7C5', 'R7C6'],
  ['R9C6', 'R9C5', 'R8C4', 'R7C4', 'R6C3', 'R6C2', 'R6C1', 'R7C2', 'R7C3', 'R8C3', 'R9C3', 'R9C2'],
  ['R2C2', 'R3C3', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R3C7', 'R2C8', 'R1C8'],
  ['R8C7', 'R7C7', 'R6C6', 'R5C5'],
  ['R5C4', 'R4C4', 'R4C3', 'R4C2', 'R5C2'],
];

return [
  new Shape('9x9'),
  ...lines.map((cells) => new RegionSumLine(...cells)),
];
