// Title: Pairs Party
// Author: Qodec
// Video: https://www.youtube.com/watch?v=oBFAw_fhKOA
// Source: https://app.crackingthecryptic.com/sudoku/r3qFHRhTbh

// Normal sudoku rules apply (default row/column/box all-different, no givens).
// Black dot: digits in ratio 1:2 -> BlackDot. White dot: consecutive digits ->
// WhiteDot. X: digits sum to 10 -> X. V: digits sum to 5 -> V. Each mark class
// binds a fixed pair of grid-adjacent cells.
// "Not all possible dots or X/V clues are necessarily given" is an explicit
// non-exhaustiveness clause: unmarked adjacent pairs are unconstrained, so the
// negative/strict variants (StrictKropki, StrictXV) do not apply here.

const whiteDots = [
  ['R3C7', 'R3C8'],
  ['R3C6', 'R4C6'],
  ['R4C7', 'R4C8'],
  ['R3C9', 'R4C9'],
  ['R6C9', 'R7C9'],
  ['R6C7', 'R6C8'],
  ['R5C4', 'R5C5'],
  ['R3C3', 'R4C3'],
  ['R2C2', 'R3C2'],
  ['R3C1', 'R3C2'],
  ['R7C1', 'R8C1'],
  ['R8C7', 'R9C7'],
];

const blackDots = [
  ['R4C5', 'R5C5'],
  ['R7C4', 'R7C5'],
];

const xMarks = [
  ['R8C5', 'R9C5'],
  ['R7C1', 'R7C2'],
  ['R6C1', 'R6C2'],
  ['R1C5', 'R2C5'],
  ['R1C8', 'R1C9'],
];

const vMarks = [
  ['R3C4', 'R4C4'],
  ['R7C7', 'R7C8'],
  ['R4C1', 'R4C2'],
];

return [
  new Shape('9x9'),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...xMarks.map(cells => new X(...cells)),
  ...vMarks.map(cells => new V(...cells)),
];
