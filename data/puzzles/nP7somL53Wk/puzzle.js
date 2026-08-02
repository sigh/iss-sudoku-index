// Title: Bends
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=nP7somL53Wk
// Source: https://sudokupad.app/z3vyld3vm7

// Each blue L-shaped line has equal sums in each 3x3-box segment. Its bend
// digit counts the distinct digits on the whole line.
const lines = [
  ['R5C3', ['R5C2', 'R5C3', 'R4C3', 'R3C3', 'R2C3', 'R1C3']],
  ['R7C5', ['R7C4', 'R7C5', 'R6C5', 'R5C5']],
  ['R3C7', ['R9C7', 'R8C7', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C8', 'R3C9']],
  ['R1C1', ['R3C1', 'R2C1', 'R1C1', 'R1C2', 'R1C3', 'R1C4', 'R1C5']],
  ['R1C9', ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9', 'R6C9']],
  ['R9C9', ['R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5']],
  ['R6C6', ['R8C6', 'R7C6', 'R6C6', 'R6C7', 'R6C8']],
  ['R4C4', ['R4C2', 'R4C3', 'R4C4', 'R3C4', 'R2C4']],
  ['R9C1', ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2']],
];

return [
  new Shape('9x9'),
  ...lines.flatMap(([bend, cells]) => [
    new RegionSumLine(...cells),
    new CountDistinct(bend, ...cells),
  ]),
];
