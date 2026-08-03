// Title: Skateboards
// Author: Derektionary
// Video: https://www.youtube.com/watch?v=LM9b0qkOvEI
// Source: https://app.crackingthecryptic.com/sudoku/bb6fQng3Qn

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9'), boxes matching the payload's drawn regions). One given.
// Purple lines: Renban (consecutive digits, any order, non-repeating).
// Black dots: BlackDot (1:2 ratio). White dots: WhiteDot (consecutive).
// Dot cell pairs transcribed from the drawn overlay list, classified
// white/black by each overlay's fill/background colour.

const renbans = [
  ['R1C4', 'R1C5', 'R1C6'],
  ['R3C5', 'R3C6', 'R3C7'],
  ['R3C2', 'R3C3', 'R3C4'],
  ['R5C7', 'R5C8', 'R5C9'],
  ['R6C3', 'R6C4', 'R6C5'],
  ['R7C6', 'R7C7', 'R7C8'],
  ['R8C2', 'R8C3', 'R8C4'],
].map(cells => new Renban(...cells));

const whiteDots = [
  ['R5C7', 'R6C7'],
  ['R5C9', 'R6C9'],
  ['R6C5', 'R7C5'],
  ['R6C3', 'R7C3'],
  ['R8C4', 'R9C4'],
  ['R8C2', 'R9C2'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R1C4', 'R2C4'],
  ['R1C6', 'R2C6'],
  ['R3C5', 'R4C5'],
  ['R3C7', 'R4C7'],
  ['R3C4', 'R4C4'],
  ['R3C2', 'R4C2'],
  ['R7C6', 'R8C6'],
  ['R7C8', 'R8C8'],
].map(cells => new BlackDot(...cells));

return [
  new Shape('9x9'),
  new Given('R7C1', 5),
  ...renbans,
  ...whiteDots,
  ...blackDots,
];
