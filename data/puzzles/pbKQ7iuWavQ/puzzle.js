// Title: Through the Looking Glass
// Author: Qodec
// Video: https://www.youtube.com/watch?v=pbKQ7iuWavQ
// Source: https://sudokupad.app/vpxtuig2lt

// Rules encoded: normal sudoku (default row/column/box all-different, no
// givens). Digits separated by an X sum to 10, digits separated by a V sum
// to 5, a black dot means one digit is double the other, a white dot means
// the digits are consecutive. "Not all possible dots or X/V clues are
// necessarily given" rules out a negative/exhaustive reading of the marks,
// so only the drawn pairs below are constrained -- no StrictKropki/StrictXV.

// Dot and X/V cell pairs transcribed from the raw payload's `difference`,
// `ratio`, and `xv` arrays (all entries use default values: difference=1,
// ratio=2; xv split by its "X"/"V" value field).

const whiteDots = [
  ['R1C1', 'R2C1'],
  ['R2C1', 'R2C2'],
  ['R1C2', 'R2C2'],
  ['R3C4', 'R4C4'],
  ['R4C3', 'R4C4'],
  ['R5C6', 'R6C6'],
  ['R6C5', 'R6C6'],
  ['R3C8', 'R4C8'],
  ['R8C3', 'R8C4'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R7C3', 'R8C3'],
  ['R3C7', 'R3C8'],
  ['R8C8', 'R8C9'],
  ['R9C8', 'R9C9'],
  ['R8C9', 'R9C9'],
].map(cells => new BlackDot(...cells));

const xClues = [
  ['R4C1', 'R4C2'],
  ['R1C4', 'R2C4'],
  ['R2C6', 'R3C6'],
  ['R6C2', 'R6C3'],
  ['R6C7', 'R7C7'],
  ['R7C6', 'R7C7'],
].map(cells => new X(...cells));

const vClues = [
  ['R3C3', 'R3C4'],
  ['R3C3', 'R4C3'],
].map(cells => new V(...cells));

return [
  new Shape('9x9'),
  ...whiteDots,
  ...blackDots,
  ...xClues,
  ...vClues,
];
