// Title: Downward Spiral
// Author: The Sudoku Skunkworks
// Video: https://www.youtube.com/watch?v=xtP1vwEHWLQ
// Source: https://app.crackingthecryptic.com/sudoku/6mMdRBBdrM

// Normal sudoku rules apply (standard 9x9 rows/cols/boxes). Digits on a
// purple line must be a set of consecutive, non-repeating digits in any
// order (Renban). Cells joined by a black dot hold digits in a 1:2 ratio
// (BlackDot); cells joined by a white dot hold consecutive digits
// (WhiteDot). "Not all possible dots are given" forbids the converse
// negative constraint (StrictKropki): unmarked adjacent pairs are left
// unconstrained by the dot rule, so only the drawn dots below are encoded.
// Some dots sit on a purple line's own edges; others join a line's end
// cell to a cell outside any line, or join two different lines' ends
// together -- all are plain Kropki dots regardless of that placement.

const renbanLines = [
  ['R2C1', 'R1C1', 'R1C2', 'R1C3'],
  ['R1C7', 'R1C8', 'R1C9', 'R2C9'],
  ['R3C5', 'R3C6', 'R3C7', 'R4C7'],
  ['R3C4', 'R3C3', 'R4C3', 'R5C3'],
  ['R5C7', 'R6C7', 'R6C6', 'R6C5'],
  ['R6C3', 'R7C3', 'R7C4', 'R7C5'],
  ['R5C9', 'R6C9', 'R7C9', 'R7C8'],
  ['R7C1', 'R8C1', 'R8C2', 'R8C3'],
];

const blackDots = [
  ['R1C2', 'R1C3'],
  ['R2C4', 'R3C4'],
  ['R2C9', 'R3C9'],
  ['R4C7', 'R5C7'],
  ['R5C5', 'R6C5'],
  ['R7C1', 'R8C1'],
  ['R8C4', 'R8C5'],
];

const whiteDots = [
  ['R1C1', 'R2C1'],
  ['R4C5', 'R5C5'],
  ['R5C2', 'R5C3'],
  ['R8C1', 'R8C2'],
  ['R7C8', 'R8C8'],
];

return [
  new Shape('9x9'),
  ...renbanLines.map(cells => new Renban(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
