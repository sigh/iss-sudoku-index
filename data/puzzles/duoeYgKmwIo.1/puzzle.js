// Title: 10/9/2022: Cereal Convention
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=duoeYgKmwIo
// Source: https://tinyurl.com/scw2c723

// Normal Sudoku. The drawn cages have distinct digits and their printed sums.
// On each drawn between line, every interior digit is strictly between the
// values in its two circled endpoint cells.

// Cages transcribed from the dashed outlines and their printed totals.
const cages = [
  [6, 'R1C1', 'R1C2', 'R1C3'], [24, 'R3C1', 'R3C2', 'R3C3'],
  [23, 'R1C7', 'R2C7', 'R3C7'], [8, 'R7C1', 'R8C1', 'R9C1'],
  [20, 'R7C3', 'R8C3', 'R9C3'], [21, 'R7C7', 'R7C8', 'R7C9'],
  [6, 'R9C7', 'R9C8', 'R9C9'], [9, 'R1C9', 'R2C9', 'R3C9'],
  [10, 'R6C5', 'R7C5'], [8, 'R3C5', 'R4C5'],
  [6, 'R5C3', 'R5C4'], [12, 'R5C6', 'R5C7'],
  [9, 'R5C1', 'R5C2'], [9, 'R1C5', 'R2C5'],
  [9, 'R8C5', 'R9C5'], [9, 'R5C8', 'R5C9'],
];

// Paths transcribed from the circular-ended lines, in their drawn order.
const betweenLines = [
  ['R1C1', 'R1C2', 'R1C3'], ['R3C1', 'R3C2', 'R3C3'],
  ['R1C7', 'R2C7', 'R3C7'], ['R1C9', 'R2C9', 'R3C9'],
  ['R7C1', 'R8C1', 'R9C1'], ['R7C3', 'R8C3', 'R9C3'],
  ['R7C7', 'R7C8', 'R7C9'], ['R9C7', 'R9C8', 'R9C9'],
  ['R5C5', 'R6C5', 'R7C5', 'R8C5'],
  ['R5C5', 'R5C6', 'R5C7', 'R5C8'],
  ['R5C5', 'R4C5', 'R3C5', 'R2C5'],
  ['R5C5', 'R5C4', 'R5C3', 'R5C2'],
  ['R7C7', 'R6C6', 'R5C5'], ['R5C5', 'R4C4', 'R3C3'],
  ['R3C7', 'R4C6', 'R5C5'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
];
