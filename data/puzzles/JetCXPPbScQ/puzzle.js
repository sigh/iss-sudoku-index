// Title: 3Z + X
// Author: Walking Writer
// Video: https://www.youtube.com/watch?v=JetCXPPbScQ
// Source: https://app.crackingthecryptic.com/sudoku/GP464L8f2H

// Normal sudoku, no givens, standard boxes. Both long diagonals are marked
// (no repeats): Diagonal(-1) is the `\` diagonal R1C1-R9C9, Diagonal(1) is
// the `/` diagonal R1C9-R9C1. Along the `/` diagonal, 4 cells are drawn as
// grey squares (must hold an even digit, encoded as a restricted Given) and
// 3 cells are drawn as arrow circles. Each arrow's shaft bends through a 2x2
// block in a "Z" shape (bulb, across, diagonally opposite, across) rather
// than running straight from the bulb; cells below are listed bulb-first,
// then the three arm cells, per the drawn Z path. White/black dots are
// ordinary adjacent-cell Kropki dots.

const GREY_EVEN = ['R2C8', 'R4C6', 'R6C4', 'R8C2'];

const ARROWS = [
  ['R3C7', 'R3C6', 'R2C7', 'R2C6'],
  ['R5C5', 'R5C4', 'R4C5', 'R4C4'],
  ['R7C3', 'R7C2', 'R6C3', 'R6C2'],
];

const WHITE_DOTS = [
  ['R1C2', 'R1C3'],
  ['R7C9', 'R8C9'],
  ['R7C8', 'R7C9'],
  ['R4C3', 'R5C3'],
  ['R5C2', 'R5C3'],
];

const BLACK_DOTS = [
  ['R8C2', 'R8C3'],
  ['R9C1', 'R9C2'],
  ['R9C3', 'R9C4'],
  ['R7C8', 'R8C8'],
  ['R5C9', 'R6C9'],
  ['R1C8', 'R1C9'],
  ['R1C8', 'R2C8'],
  ['R2C5', 'R2C6'],
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...GREY_EVEN.map(cell => new Given(cell, 2, 4, 6, 8)),
  ...ARROWS.map(cells => new Arrow(...cells)),
  ...WHITE_DOTS.map(cells => new WhiteDot(...cells)),
  ...BLACK_DOTS.map(cells => new BlackDot(...cells)),
];
