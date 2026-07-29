// Title: High Impact
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=z57CuwkDRbI
// Source: https://sudokupad.app/t884uj5ock#puzzle1

// Killer cages: each displayed top-left total is the sum of distinct digits in
// its dashed cage. The table transcribes the cage cells and totals from the drawing.
const cages = [
  [15, 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'],
  [10, 'R1C2', 'R2C1', 'R2C2'],
  [28, 'R5C1', 'R6C1', 'R6C2', 'R7C1'],
  [28, 'R1C5', 'R1C6', 'R1C7', 'R2C6'],
  [22, 'R5C6', 'R6C5', 'R6C6'],
  [11, 'R6C3', 'R6C4'],
  [11, 'R3C6', 'R4C6'],
  [12, 'R4C4', 'R4C5', 'R5C4', 'R5C5'],
  [11, 'R4C8', 'R4C9'],
  [15, 'R8C4', 'R9C4'],
  [10, 'R9C6', 'R9C7'],
  [10, 'R6C9', 'R7C9'],
  [17, 'R8C8', 'R8C9', 'R9C8', 'R9C9'],
];

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
];
