// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=7r89dZIjci0
// Source: https://sudokupad.app/NfJTHg3Q2M

// Normal sudoku rules (default rows/cols/boxes, standard 3x3 regions).
// 26 killer cages partition the whole grid: each cage's digits are distinct
// and sum to the printed total. Cage cells and totals transcribed from the
// payload's `cages` array.
const cages = [
  [15, 'R1C1', 'R2C1', 'R3C1'],
  [7, 'R1C2', 'R1C3', 'R1C4'],
  [35, 'R2C2', 'R2C3', 'R3C2', 'R4C1', 'R4C2'],
  [21, 'R5C1', 'R5C2', 'R6C1', 'R6C2', 'R7C1'],
  [15, 'R7C2', 'R7C3'],
  [16, 'R8C1', 'R8C2', 'R9C1'],
  [5, 'R9C2', 'R9C3'],
  [18, 'R7C4', 'R8C3', 'R8C4'],
  [3, 'R6C3', 'R6C4'],
  [12, 'R5C3', 'R5C4'],
  [15, 'R3C3', 'R4C3'],
  [25, 'R1C5', 'R2C4', 'R2C5', 'R2C6', 'R3C5'],
  [27, 'R3C4', 'R3C6', 'R4C4', 'R4C5', 'R4C6', 'R5C5'],
  [11, 'R6C5', 'R7C5', 'R8C5'],
  [16, 'R9C4', 'R9C5', 'R9C6'],
  [15, 'R9C7', 'R9C8'],
  [12, 'R8C8', 'R8C9', 'R9C9'],
  [22, 'R1C6', 'R1C7', 'R1C8'],
  [16, 'R1C9', 'R2C9', 'R3C9'],
  [20, 'R2C7', 'R2C8', 'R3C8', 'R4C8', 'R4C9'],
  [4, 'R3C7', 'R4C7'],
  [12, 'R5C6', 'R5C7'],
  [15, 'R6C6', 'R6C7'],
  [14, 'R7C6', 'R8C6', 'R8C7'],
  [7, 'R7C7', 'R7C8'],
  [27, 'R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
