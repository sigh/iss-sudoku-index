// Title: Oct. 19, 2022: Killer Whispers
// Author: clover!
// Video: https://www.youtube.com/watch?v=FpaGo21lbhM
// Source: https://tinyurl.com/227tmzwu

// Standard Sudoku rules apply. Green lines are German whispers with difference 5.
// The cage data is transcribed from the dashed cages and their printed totals.
const cages = [
  [7, 'R1C1', 'R1C2'], [8, 'R2C3', 'R2C4'], [9, 'R3C5', 'R3C6'],
  [11, 'R1C5', 'R1C6'], [10, 'R2C7', 'R2C8'], [12, 'R4C7', 'R4C8'],
  [11, 'R3C1', 'R3C2'], [8, 'R4C3', 'R4C4'], [7, 'R5C5', 'R5C6'],
  [7, 'R6C7', 'R6C8'], [13, 'R5C1', 'R5C2'], [11, 'R8C3', 'R8C4'],
  [9, 'R7C1', 'R7C2'], [10, 'R9C5', 'R9C6'], [11, 'R8C7', 'R8C8'],
  [11, 'R7C5', 'R7C6'], [11, 'R6C3', 'R6C4'],
];

// The green paths are transcribed in their drawn cell order.
const lines = [
  ['R1C5', 'R1C6', 'R2C7', 'R2C8', 'R3C9'],
  ['R1C1', 'R1C2', 'R2C3', 'R2C4', 'R3C5', 'R3C6', 'R4C7', 'R4C8', 'R5C9'],
  ['R3C1', 'R3C2', 'R4C3', 'R4C4', 'R5C5', 'R5C6', 'R6C7', 'R6C8', 'R7C9'],
  ['R5C1', 'R5C2', 'R6C3', 'R6C4', 'R7C5', 'R7C6', 'R8C7', 'R8C8', 'R9C9'],
  ['R7C1', 'R7C2', 'R8C3', 'R8C4', 'R9C5', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...lines.map(cells => new Whisper(5, ...cells)),
];
