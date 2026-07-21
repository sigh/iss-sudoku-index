// Title: Reg10ns
// Author: Nicolas Duhail
// Video: https://www.youtube.com/watch?v=HHc5-eK_oCE
// Source: https://sudokupad.app/rjv6naxv8x

// Normal Sudoku rules apply. Each blue path is both a region sum line (box
// borders split it into equal-sum segments) and a 10 line (the entire path
// partitions into contiguous groups that each sum to 10).
const blueLines = [
  ['R6C4', 'R5C3', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  [
    'R1C6', 'R2C7', 'R3C8', 'R4C9', 'R5C8',
    'R6C7', 'R7C6', 'R8C5', 'R7C4', 'R6C3',
  ],
  ['R2C3', 'R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2', 'R8C3'],
  [
    'R7C1', 'R8C1', 'R9C2', 'R9C3', 'R8C4', 'R9C4', 'R9C5',
    'R9C6', 'R8C7', 'R7C8', 'R7C9', 'R8C9', 'R9C8',
  ],
  ['R4C7', 'R4C6', 'R5C5'],
];

return [
  new Shape('9x9'),
  ...blueLines.flatMap(cells => [
    new RegionSumLine(...cells),
    new SumLine(10, ...cells),
  ]),
];
