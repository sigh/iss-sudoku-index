// Title: Alarm
// Author: zetamath
// Video: https://www.youtube.com/watch?v=4nnuyyvQ2jI
// Source: https://sudokupad.app/nivm1qdkzj

// Normal sudoku rules (default 9x9 with default 3x3 boxes).
// Thick grey lines: split into contiguous, non-overlapping segments that
// each sum to exactly 10 -> SumLine(10, ...).
// Purple lines: non-repeating consecutive set, any order -> Renban.
// Thin grey lines: interior digits strictly between the two circle
// endpoints (first/last cell of the path) -> Between.
// Black dot: 1:2 ratio. Not all dots are necessarily given, so this stays a
// plain (non-strict) positive constraint -> BlackDot.

// Thick grey ("sum to 10 per segment") lines. Each is one unfragmented
// payload `line` entry; the payload's other two `line` entries duplicate
// the renban lines below in purple for display only and are not modelled
// separately.
const tenLines = [
  ['R1C3', 'R1C2', 'R1C1', 'R2C1', 'R3C1'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9', 'R3C9'],
  ['R7C7', 'R8C7', 'R9C8'],
];

const renbanLines = [
  ['R2C4', 'R3C5', 'R4C6', 'R5C7', 'R6C8'],
  ['R4C2', 'R5C3', 'R6C4', 'R7C5'],
];

// Between lines: first and last cell of each path are the circle endpoints.
const betweenLines = [
  ['R2C3', 'R1C4', 'R1C5', 'R1C6', 'R2C7'],
  ['R3C2', 'R4C1', 'R5C1', 'R6C1', 'R7C2'],
  ['R3C8', 'R4C9', 'R5C9', 'R6C9', 'R7C8'],
  ['R9C3', 'R8C4', 'R8C5', 'R8C6', 'R9C7'],
  ['R8C3', 'R9C2', 'R9C1'],
];

const blackDots = [
  ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),

  ...tenLines.map(cells => new SumLine(10, ...cells)),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...betweenLines.map(cells => new Between(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
