// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=V7SFCQQ74gE
// Source: https://sudokupad.app/qLNf2hFdD8

// Normal sudoku rules (default rows/cols/boxes; payload regions match the
// default box partition). Killer cages: digits in a cage may not repeat and
// must sum to the indicated total -- Cage(sum, ...cells) enforces both.
// Cage cells and totals transcribed from the payload's `cages` array.
const cages = [
  [28, 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3'],
  [3, 'R1C3', 'R1C4'],
  [26, 'R1C5', 'R1C6', 'R2C6', 'R3C6'],
  [29, 'R1C7', 'R2C7', 'R3C7', 'R4C7', 'R3C8'],
  [13, 'R1C8', 'R1C9'],
  [15, 'R2C8', 'R2C9', 'R3C9', 'R4C9'],
  [16, 'R3C1', 'R3C2', 'R4C1'],
  [16, 'R3C3', 'R3C4', 'R4C4'],
  [5, 'R3C5', 'R4C5'],
  [25, 'R4C2', 'R5C1', 'R5C2', 'R6C2'],
  [10, 'R4C3', 'R5C3', 'R6C3'],
  [10, 'R5C4', 'R5C5'],
  [12, 'R4C6', 'R5C6', 'R6C6'],
  [22, 'R4C8', 'R5C7', 'R5C8', 'R5C9', 'R6C8'],
  [28, 'R6C9', 'R7C9', 'R8C8', 'R8C9'],
  [11, 'R9C8', 'R9C9'],
  [17, 'R6C7', 'R7C7', 'R7C8', 'R8C7', 'R9C7'],
  [22, 'R7C6', 'R8C6', 'R9C5', 'R9C6'],
  [15, 'R6C5', 'R7C5'],
  [4, 'R8C4', 'R8C5'],
  [18, 'R6C4', 'R7C3', 'R7C4'],
  [13, 'R6C1', 'R7C1', 'R7C2'],
  [13, 'R9C3', 'R9C4'],
  [22, 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
