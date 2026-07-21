// Title: Pinwheel
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=f0nXBbpoCHU
// Source: https://sudokupad.app/erin-toler/pinwheel

// Normal Sudoku rules apply. Box borders divide each blue region sum line
// into segments with the same sum.
const blueLines = [
  [
    'R9C5', 'R8C5', 'R7C5', 'R7C6', 'R6C5', 'R6C6', 'R5C7',
    'R4C7', 'R5C6', 'R4C6', 'R3C5', 'R3C4', 'R4C5', 'R4C4',
    'R5C3', 'R6C3', 'R5C4', 'R6C4', 'R7C3', 'R7C2', 'R6C1',
    'R6C2',
  ],
  ['R5C2', 'R4C2', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R2C3'],
  ['R2C5', 'R2C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9', 'R2C8'],
  ['R3C7', 'R3C8', 'R4C8', 'R5C8'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R8C4'],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
