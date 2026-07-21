// Title: Blue Frame
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=BiET2qD45hg
// Source: https://sudokupad.app/5i6eemxl09

// Box borders split each blue line into equal-sum segments.
const blueLines = [
  ['R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3', 'R9C4', 'R9C5'],
  ['R9C5', 'R9C6', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R7C9', 'R6C9', 'R5C9'],
  ['R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
  ['R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1', 'R4C1', 'R5C1'],
  ['R5C1', 'R4C2', 'R3C3', 'R2C4', 'R1C5'],
  ['R5C9', 'R6C8', 'R7C7', 'R8C6', 'R9C5'],
  ['R3C5', 'R2C6', 'R3C7', 'R4C8', 'R5C8'],
  ['R6C2', 'R7C3', 'R8C4'],
  ['R9C1', 'R8C2', 'R7C3', 'R6C4', 'R5C5', 'R4C6', 'R3C7', 'R2C8', 'R1C9'],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
