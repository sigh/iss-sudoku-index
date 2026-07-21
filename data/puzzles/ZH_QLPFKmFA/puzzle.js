// Title: Aced
// Author: James Kopp
// Video: https://www.youtube.com/watch?v=ZH_QLPFKmFA
// Source: https://sudokupad.app/4yizx5451j

// The repeated final cell closes each loop while retaining its attached stem.
const orangeLine = [
  'R6C1', 'R5C2', 'R4C3', 'R4C4', 'R4C5', 'R3C6',
  'R2C6', 'R1C5', 'R1C4', 'R2C3', 'R3C3', 'R4C3',
];
// The blue line revisits R7C6. Group its distinct cells by box so that this
// junction contributes once to its box's total.
const blueLineBoxSegments = [
  ['R9C4', 'R8C5', 'R7C6'],
  ['R7C7', 'R7C8'],
  ['R6C9', 'R5C9', 'R4C8', 'R4C7'],
  ['R5C6', 'R6C6'],
];

const magicSquareLines = [
  ['R4C4', 'R4C5', 'R4C6'],
  ['R5C4', 'R5C5', 'R5C6'],
  ['R6C4', 'R6C5', 'R6C6'],
  ['R4C4', 'R5C4', 'R6C4'],
  ['R4C5', 'R5C5', 'R6C5'],
  ['R4C6', 'R5C6', 'R6C6'],
  ['R4C4', 'R5C5', 'R6C6'],
  ['R4C6', 'R5C5', 'R6C4'],
];

return [
  new Shape('9x9'),
  new Given('R1C8', 3),
  new Given('R2C9', 1),
  new Given('R5C3', 2),
  new Given('R7C5', 2),
  new Diagonal(-1),
  new Diagonal(1),
  new Whisper(4, ...orangeLine),
  new EqualSum(...blueLineBoxSegments),
  new EqualSum(...magicSquareLines),
];
