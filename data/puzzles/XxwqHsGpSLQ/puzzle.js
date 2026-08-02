// Title: Diamond mining
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=XxwqHsGpSLQ
// Source: https://app.crackingthecryptic.com/df7B2RJ4gB

// Normal Sudoku rules apply. Diamond digits count diamond cells holding that digit;
// knight-move cells differ; black dots are 2:1 ratios; arrow shafts sum to their circles.
// Diamond cells transcribed from the 35 closed diamond outlines.
const diamonds = [
  'R1C5',
  'R2C1', 'R2C2', 'R2C3', 'R2C6',
  'R3C2', 'R3C3', 'R3C7', 'R3C8',
  'R4C1', 'R4C2', 'R4C4', 'R4C5', 'R4C6',
  'R5C1', 'R5C2', 'R5C4', 'R5C5', 'R5C7', 'R5C8',
  'R6C1', 'R6C2', 'R6C3', 'R6C4',
  'R7C1', 'R7C3', 'R7C7', 'R7C8',
  'R8C5', 'R8C6', 'R8C8',
  'R9C2', 'R9C3', 'R9C5', 'R9C6',
];

// Black-dot edges transcribed from the five black rounded marks.
const blackDots = [
  ['R5C5', 'R5C6'], ['R7C3', 'R8C3'], ['R2C2', 'R3C2'],
  ['R1C7', 'R1C8'], ['R9C1', 'R9C2'],
];

return [
  new Shape('9x9'),
  new CountingCircles(...diamonds),
  new AntiKnight(),
  ...blackDots.map(([a, b]) => new BlackDot(a, b)),
  new Arrow('R6C6', 'R5C6', 'R5C5', 'R4C4'),
  new Arrow('R9C3', 'R8C3', 'R7C3', 'R6C2'),
  new Arrow('R1C6', 'R2C6', 'R3C6', 'R4C7'),
];
