// Title: Tetris at 3am
// Author: melzzzy
// Video: https://www.youtube.com/watch?v=9LDLxp75A2s
// Source: https://app.crackingthecryptic.com/sudoku/PtLN7jLHBm

// Normal sudoku, no givens. Twelve 4-cell tetromino cages: digits cannot
// repeat within a cage, and each cage sums to 10 or 30 -- the rules text
// states this as one shared rule and never assigns a total to any specific
// cage, so each cage is encoded as Cage(10) OR Cage(30) (Cage enforces both
// all-different and the sum). Black dots mark 1:2-ratio pairs, white dots
// mark consecutive pairs; not all dots are given, so no negative/exhaustive
// Kropki constraint is added. Cage cell lists are transcribed from the
// drawn cage outlines; dot cell pairs from the drawn dot overlays (fill
// color distinguishes black from white).

const cages = [
  ['R2C1', 'R2C2', 'R3C2', 'R3C3'],
  ['R2C4', 'R3C4', 'R4C4', 'R5C4'],
  ['R5C3', 'R6C3', 'R6C4', 'R7C4'],
  ['R7C2', 'R8C2', 'R8C3', 'R8C4'],
  ['R9C6', 'R9C7', 'R9C8', 'R9C9'],
  ['R5C5', 'R6C5', 'R6C6', 'R7C6'],
  ['R3C7', 'R4C7', 'R5C7', 'R4C8'],
  ['R5C9', 'R6C9', 'R7C9', 'R8C9'],
  ['R8C1', 'R9C1', 'R9C2', 'R9C3'],
  ['R7C5', 'R8C5', 'R9C5', 'R8C6'],
  ['R4C2', 'R4C3', 'R5C2', 'R6C2'],
  ['R6C7', 'R6C8', 'R7C7', 'R7C8'],
];

const blackDots = [
  ['R1C7', 'R2C7'],
  ['R4C2', 'R5C2'],
  ['R7C5', 'R7C6'],
  ['R7C5', 'R8C5'],
  ['R8C1', 'R9C1'],
];

const whiteDots = [
  ['R1C7', 'R1C8'],
  ['R1C1', 'R1C2'],
  ['R2C2', 'R3C2'],
  ['R2C6', 'R3C6'],
  ['R3C9', 'R4C9'],
  ['R4C4', 'R4C5'],
  ['R6C5', 'R6C6'],
  ['R5C8', 'R6C8'],
  ['R7C2', 'R7C3'],
  ['R9C3', 'R9C4'],
  ['R9C6', 'R9C7'],
];

return [
  ...cages.map(cells => new Or([new Cage(10, ...cells), new Cage(30, ...cells)])),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
