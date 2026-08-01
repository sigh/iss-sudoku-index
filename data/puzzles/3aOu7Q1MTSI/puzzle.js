// Title: DUNE 2
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=3aOu7Q1MTSI
// Source: https://sudokupad.app/82gfkhwo9b

// Normal Sudoku rules apply. Blue lines have equal sums in every box-bounded
// segment; the green line is a German whisper; marked X, V, and white-dot
// dominoes respectively sum to 10, sum to 5, and contain consecutive digits.
// The rules say not all Xs, Vs, and dots are given, so no negative domino rule
// is imposed.
// Blue-line paths are transcribed from the four blue drawn lines.
const blueLines = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C4', 'R3C4', 'R4C3', 'R4C2', 'R4C1'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C2', 'R6C3', 'R7C4', 'R8C4', 'R9C4'],
  ['R6C9', 'R6C8', 'R6C7', 'R7C6', 'R8C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R1C6', 'R2C6', 'R3C6', 'R4C7', 'R4C8', 'R3C9', 'R2C9', 'R1C9'],
];

// The green drawn line follows this ordered cell path.
const whisper = ['R4C4', 'R3C5', 'R4C6', 'R5C5', 'R6C4', 'R6C5', 'R6C6'];

// X, V, and white-dot pairs are transcribed from their respective drawn marks.
const xs = [['R2C4', 'R3C4'], ['R7C6', 'R8C6'], ['R8C4', 'R9C4'], ['R1C6', 'R2C6']];
const vs = [['R5C1', 'R5C2'], ['R5C8', 'R5C9'], ['R7C2', 'R7C3'], ['R3C7', 'R3C8']];
const dots = [['R1C1', 'R1C2'], ['R8C1', 'R9C1'], ['R1C9', 'R2C9']];

return [
  new Shape('9x9'),
  ...blueLines.map(cells => new RegionSumLine(...cells)),
  new Whisper(5, ...whisper),
  ...xs.map(cells => new X(...cells)),
  ...vs.map(cells => new V(...cells)),
  ...dots.map(cells => new WhiteDot(...cells)),
];
