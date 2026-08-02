// Title: Ancient Altar
// Author: Myxo
// Video: https://www.youtube.com/watch?v=S2zrc85C2BM
// Source: https://app.crackingthecryptic.com/sudoku/h7FRNL2nM6

// Normal Sudoku rules apply. Yellow lines are entropic: adjacent cells belong
// to different groups among 1-3, 4-6, and 7-9. The rectangular line is closed.
// The blue rising diagonal has no repeated digits. White dots are consecutive;
// black dots have digits in a 2:1 ratio.

// Yellow line paths transcribed from the source drawing; the final two cells
// on the closed path cover the entropy window across its join.
const entropyLines = [
  ['R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7', 'R6C7', 'R5C7', 'R4C7', 'R3C7', 'R3C6', 'R3C5'],
  ['R5C4', 'R6C5'],
  ['R6C4', 'R5C5', 'R4C6'],
  ['R2C1', 'R3C1'],
  ['R7C9', 'R8C9'],
  [
    'R2C2', 'R3C2', 'R4C2', 'R5C2', 'R6C2', 'R7C2', 'R8C2', 'R8C3',
    'R8C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8',
    'R4C8', 'R3C8', 'R2C8', 'R2C7', 'R2C6', 'R2C5', 'R2C4', 'R2C3',
    'R2C2', 'R3C2',
  ],
];

// Edge dots transcribed from the source overlays.
const blackDots = [
  ['R5C1', 'R6C1'],
  ['R5C9', 'R6C9'],
];
const whiteDots = [
  ['R9C4', 'R9C5'],
  ['R1C5', 'R1C6'],
];

return [
  new Shape('9x9'),
  ...entropyLines.map(cells => new Entropic(...cells)),
  new Diagonal(1),
  ...blackDots.map(cells => new BlackDot(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
];
