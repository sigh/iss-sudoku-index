// Title: 5
// Author: Dennis Chen
// Video: https://www.youtube.com/watch?v=pvHAxxplxm4
// Source: https://app.crackingthecryptic.com/sudoku/hHGhhtR2TT

// Normal sudoku rules apply (standard 3x3 boxes, no givens). One line: adjacent
// cells on it must differ by 5 or more (Whisper's default difference is 5,
// matching the rule exactly). Six V markers (sum to 5) and one X marker (sum
// to 10) sit on individual cell-edge pairs. The rules state "not all Xs and
// Vs are given," so unmarked adjacent pairs carry no XV constraint (the
// ordinary, non-strict XV convention) -- StrictXV is not used.

const line = [
  'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R2C3', 'R3C3', 'R4C3', 'R5C3',
  'R5C4', 'R5C5', 'R5C6', 'R5C7', 'R6C7', 'R7C7', 'R8C7', 'R9C7', 'R9C6',
  'R9C5', 'R9C4', 'R9C3',
];

// V/X edge markers: small "X"/"V" letters centred on individual cell edges.
const vPairs = [
  ['R1C1', 'R2C1'],
  ['R6C2', 'R7C2'],
  ['R7C3', 'R8C3'],
  ['R8C3', 'R8C4'],
  ['R2C5', 'R3C5'],
  ['R5C9', 'R6C9'],
];
const xPairs = [
  ['R4C5', 'R4C6'],
];

return [
  new Shape('9x9'),
  new Whisper(...line),
  ...vPairs.map(pair => new V(...pair)),
  ...xPairs.map(pair => new X(...pair)),
];
