// Title: Oct. 14, 2023: Zone Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=6IMmSXJ2-Zo
// Source: https://tinyurl.com/5n7dwsdx

// Normal Sudoku rules apply. Each outlined cage must contain every digit in
// its printed string. The table is transcribed from the drawn cage clues.
const zones = [
  ['2', 'R1C3', 'R1C4'],
  ['4', 'R3C9', 'R4C9'],
  ['5', 'R6C1', 'R7C1'],
  ['6', 'R9C3', 'R9C4'],
  ['7', 'R9C6', 'R9C7'],
  ['8', 'R6C9', 'R7C9'],
  ['1', 'R3C1', 'R4C1'],
  ['3', 'R1C6', 'R1C7'],
  ['7_9', 'R5C3', 'R5C4'],
  ['6_8', 'R3C5', 'R4C5'],
  ['2_6', 'R5C6', 'R5C7'],
  ['4_9', 'R6C5', 'R7C5'],
  ['1_2_9', 'R1C1', 'R1C2', 'R2C1'],
  ['3_4_6', 'R1C8', 'R1C9', 'R2C9'],
  ['1_7_8', 'R8C9', 'R9C8', 'R9C9'],
  ['4_5_6', 'R8C1', 'R9C1', 'R9C2'],
];

const quadZones = [
  ['R6C3', 1, 3, 4, 6],
  ['R3C6', 2, 4, 5, 7],
  ['R6C6', 1, 3, 5, 8],
  ['R3C3', 1, 2, 7, 8],
];

return [
  new Shape('9x9'),
  ...zones.map(([digits, ...cells]) => new ContainAtLeast(digits, ...cells)),
  ...quadZones.map(([topLeft, ...digits]) => new Quad(topLeft, ...digits)),
];
