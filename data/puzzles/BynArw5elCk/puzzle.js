// Title: XV Ring
// Author: Aron Lide
// Video: https://www.youtube.com/watch?v=BynArw5elCk
// Source: https://app.crackingthecryptic.com/sudoku/g87HtJMGtg

// Normal sudoku on the default 3x3-box 9x9 grid (payload regions are exactly
// the nine boxes). Circled V/X mark adjacent-pair sums of 5/10. Filled black
// dots mark a 2:1 ratio (BlackDot); filled white dots mark consecutive digits
// (WhiteDot). The rules state every V and X is given, so StrictXV applies:
// any unmarked adjacent pair sums to neither 5 nor 10. The rules state dots
// are NOT all given, so no StrictKropki: unmarked pairs are unconstrained.
// Cell pairs below are transcribed from the payload's overlay coordinates.

const vMarks = [
  ['R3C3', 'R3C4'],
  ['R3C7', 'R4C7'],
  ['R6C3', 'R7C3'],
  ['R7C6', 'R7C7'],
];

const xMarks = [
  ['R3C5', 'R3C6'],
  ['R4C3', 'R5C3'],
  ['R5C7', 'R6C7'],
  ['R7C4', 'R7C5'],
];

const blackDots = [
  ['R1C8', 'R1C9'],
  ['R8C1', 'R8C2'],
  ['R8C2', 'R9C2'],
  ['R8C8', 'R9C8'],
];

const whiteDots = [
  ['R5C8', 'R5C9'],
];

return [
  new Shape('9x9'),
  ...vMarks.map(cells => new V(...cells)),
  ...xMarks.map(cells => new X(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  new StrictXV(),
];
