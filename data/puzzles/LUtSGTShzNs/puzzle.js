// Title: It's only logical
// Author: HalfBakedLunatic (aka David Workman)
// Video: https://www.youtube.com/watch?v=LUtSGTShzNs
// Source: https://sudokupad.app/t80utgm1os

// Normal sudoku, no givens. White dots mark consecutive pairs, black dots mark
// 2:1 ratio pairs, X marks pairs summing to 10, V marks pairs summing to 5 -
// not all dots/X's/V's are shown, so absence carries no information. Two
// 3-cell cages each sum to 21 with distinct digits.

const cages = [
  ['R4C1', 'R5C1', 'R6C1', 21],
  ['R4C9', 'R5C9', 'R6C9', 21],
];

const whiteDots = [
  ['R9C1', 'R9C2'],
  ['R7C5', 'R7C6'],
  ['R2C5', 'R2C6'],
  ['R1C8', 'R1C9'],
];

const blackDots = [
  ['R7C3', 'R8C3'],
  ['R7C4', 'R8C4'],
  ['R2C6', 'R3C6'],
  ['R2C7', 'R3C7'],
  ['R8C4', 'R8C5'],
];

const xClues = [
  ['R1C3', 'R2C3'],
  ['R4C4', 'R5C4'],
  ['R5C6', 'R6C6'],
  ['R8C7', 'R9C7'],
  ['R1C1', 'R1C2'],
  ['R9C8', 'R9C9'],
];

const vClues = [
  ['R2C3', 'R3C3'],
  ['R4C3', 'R4C4'],
  ['R6C6', 'R6C7'],
  ['R7C7', 'R8C7'],
];

return [
  ...cages.map(([a, b, c, sum]) => new Cage(sum, a, b, c)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xClues.map(cells => new X(...cells)),
  ...vClues.map(cells => new V(...cells)),
];
