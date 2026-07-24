// Title: I'm Blue
// Author: sujoyku
// Video: https://www.youtube.com/watch?v=pmExQtjtItw
// Source: https://sudokupad.app/2n7efk46a1

// Normal Sudoku rules apply; no given digits. Every blue line is a region
// sum line: box borders split it into segments that each sum to the same
// total. Different lines may use different totals.
// Cell lists below are transcribed from the drawn line paths, in drawn order.
const blueLines = [
  ['R2C8', 'R2C7', 'R2C6', 'R3C6', 'R4C5', 'R3C4', 'R2C4', 'R1C4'],
  ['R4C1', 'R4C2', 'R4C3', 'R5C4', 'R6C3', 'R6C2', 'R7C2', 'R8C2'],
  ['R5C3', 'R5C2', 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R3C5', 'R2C5', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C7', 'R3C8', 'R3C9', 'R4C9', 'R4C8'],
  ['R7C3', 'R8C3', 'R8C4', 'R8C5'],
  ['R4C4', 'R3C3', 'R2C2'],
  ['R6C8', 'R6C9', 'R7C8', 'R8C8', 'R8C7', 'R7C7', 'R8C6', 'R9C6'],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
