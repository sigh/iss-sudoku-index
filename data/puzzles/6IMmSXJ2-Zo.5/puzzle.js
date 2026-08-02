// Title: October 10, 2023: Killer
// Author: clover!
// Video: https://www.youtube.com/watch?v=6IMmSXJ2-Zo
// Source: https://tinyurl.com/4hfdzvvt

// Normal sudoku. Digits in each listed cage are distinct and sum to its total.

// Killer cages transcribed from the source payload, in its listed order.
const cages = [
  [10, 'R1C1', 'R1C2', 'R2C1', 'R2C2'],
  [6, 'R1C3', 'R1C4'],
  [7, 'R3C1', 'R4C1'],
  [9, 'R2C3', 'R2C4'],
  [10, 'R3C2', 'R4C2'],
  [29, 'R1C8', 'R1C9', 'R2C8', 'R2C9'],
  [15, 'R1C6', 'R1C7'],
  [13, 'R3C9', 'R4C9'],
  [10, 'R3C8', 'R4C8'],
  [11, 'R2C6', 'R2C7'],
  [30, 'R8C1', 'R8C2', 'R9C1', 'R9C2'],
  [14, 'R6C2', 'R7C2'],
  [13, 'R8C3', 'R8C4'],
  [10, 'R6C1', 'R7C1'],
  [9, 'R9C3', 'R9C4'],
  [10, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
  [11, 'R8C6', 'R8C7'],
  [11, 'R6C8', 'R7C8'],
  [13, 'R9C6', 'R9C7'],
  [10, 'R6C9', 'R7C9'],
  [15, 'R3C3', 'R4C3'],
  [5, 'R7C3', 'R7C4'],
  [13, 'R6C7', 'R7C7'],
  [4, 'R3C6', 'R3C7'],
];

return [
  new Shape('9x9'),
  ...cages.map(([total, ...cells]) => new Cage(total, ...cells)),
];
