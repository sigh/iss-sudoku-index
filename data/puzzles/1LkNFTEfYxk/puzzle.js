// Title: c.dot
// Author: arctan
// Video: https://www.youtube.com/watch?v=1LkNFTEfYxk
// Source: https://sudokupad.app/nhz9bqp4ol
//
// Normal sudoku. White dots (consecutive) and black dots (1:2 ratio) are
// drawn on the listed adjacent pairs only -- no unmarked-pair negative
// constraint is stated. Digits may not repeat on either marked diagonal;
// both diagonals are drawn cell-by-cell in the source, so no reading is
// required for which cells they cover.

const whiteDots = [
  ['R3C4', 'R3C5'],
  ['R3C5', 'R3C6'],
  ['R4C3', 'R5C3'],
  ['R5C3', 'R6C3'],
  ['R7C4', 'R7C5'],
  ['R7C5', 'R7C6'],
  ['R2C2', 'R3C2'],
  ['R1C2', 'R2C2'],
  ['R4C8', 'R5C8'],
];

const blackDots = [
  ['R6C3', 'R7C3'],
  ['R7C3', 'R7C4'],
  ['R3C3', 'R4C3'],
  ['R3C3', 'R3C4'],
  ['R3C6', 'R3C7'],
  ['R7C6', 'R7C7'],
  ['R6C7', 'R7C7'],
  ['R3C7', 'R4C7'],
  ['R8C2', 'R9C2'],
  ['R7C2', 'R8C2'],
  ['R5C8', 'R6C8'],
];

return [
  new Shape('9x9'),

  // direction 1 = '/' (bottom-left to top-right), -1 = '\' (top-left to
  // bottom-right); both diagonals are marked no-repeat.
  new Diagonal(1),
  new Diagonal(-1),

  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
