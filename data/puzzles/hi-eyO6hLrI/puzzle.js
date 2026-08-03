// Title: Fanfare
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=hi-eyO6hLrI
// Source: https://app.crackingthecryptic.com/sudoku/N4LJbJP3TR

// Normal sudoku on a 9x9 grid with the drawn 3x3 boxes (the ISS default), no
// givens. Arrow(bulb, ...arm) sums the arm to the circle. WhiteDot/BlackDot
// pairs are the drawn edge dots (consecutive / 1:2 ratio); the rules do not
// claim every such pair is marked, so no negative (StrictKropki) constraint
// is added.

const arrows = [
  ['R7C8', 'R6C8', 'R5C8'],
  ['R7C8', 'R6C9', 'R5C9'],
  ['R7C8', 'R6C7', 'R5C6'],
  ['R7C2', 'R6C1', 'R5C1'],
  ['R7C2', 'R6C2', 'R5C2'],
  ['R7C2', 'R6C3', 'R5C4'],
  ['R9C3', 'R9C4', 'R9C5'],
  ['R9C7', 'R9C6', 'R8C6'],
  ['R7C4', 'R8C4', 'R8C5'],
  ['R3C4', 'R2C4', 'R2C3', 'R1C2'],
  ['R3C6', 'R2C6', 'R1C7', 'R1C8'],
];

const whiteDots = [
  ['R4C3', 'R5C3'],
  ['R4C5', 'R5C5'],
  ['R1C2', 'R2C2'],
];

const blackDots = [
  ['R5C7', 'R6C7'],
  ['R8C5', 'R8C6'],
  ['R1C8', 'R1C9'],
];

return [
  new Shape('9x9'),
  ...arrows.map(cells => new Arrow(...cells)),
  ...whiteDots.map(cells => new WhiteDot(...cells)),
  ...blackDots.map(cells => new BlackDot(...cells)),
];
