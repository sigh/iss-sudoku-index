// Title: Hooked
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=T9WhzHIzjXs
// Source: https://sudokupad.app/zd0vryms8s

// Normal Sudoku rules apply. Box borders divide each blue line into segments
// with the same sum.
// Blue line paths are transcribed from the drawing in the source.
const blueLines = [
  ['R6C2', 'R6C1', 'R7C1', 'R8C1', 'R8C2', 'R9C2', 'R9C3', 'R9C4', 'R8C4'],
  ['R5C2', 'R5C3', 'R6C4', 'R7C5', 'R7C6', 'R8C7'],
  ['R3C5', 'R4C5', 'R5C5', 'R5C6', 'R5C7'],
  ['R3C6', 'R4C7'],
  ['R2C2', 'R3C2', 'R3C3', 'R4C4'],
  ['R8C8', 'R7C8', 'R6C8', 'R5C9', 'R4C9'],
  ['R2C8', 'R2C9', 'R1C9', 'R1C8', 'R1C7', 'R1C6', 'R1C5'],
];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
];
