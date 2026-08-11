// Title: The Knot
// Author: Clover
// Video: https://www.youtube.com/watch?v=FdBXKP_Vn6g
// Source: https://app.crackingthecryptic.com/sudoku/RM396Mnt7m

// Normal sudoku rules (default rows/cols/boxes, confirmed standard from the
// payload's regions array). No given digits. Killer cages: distinct digits
// summing to the printed total; cages do not cover every cell.

// Cage cells and totals transcribed from the drawn `cages` array.
const cages = [
  [13, 'R2C2', 'R2C3', 'R3C2'],
  [7, 'R3C3', 'R3C4', 'R4C3'],
  [34, 'R1C4', 'R1C5', 'R1C6', 'R2C4', 'R2C6'],
  [23, 'R2C7', 'R2C8', 'R3C8'],
  [30, 'R4C8', 'R4C9', 'R5C9', 'R6C8', 'R6C9'],
  [31, 'R8C4', 'R8C6', 'R9C4', 'R9C5', 'R9C6'],
  [13, 'R6C5', 'R7C4', 'R7C5'],
  [14, 'R7C2', 'R8C2', 'R8C3'],
  [35, 'R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2'],
  [9, 'R5C3', 'R5C4', 'R6C3'],
  [14, 'R4C7', 'R5C6', 'R5C7'],
  [7, 'R6C7', 'R7C6', 'R7C7'],
  [20, 'R7C8', 'R8C7', 'R8C8'],
  [10, 'R3C5', 'R3C6', 'R4C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
