// Title: Left Right Left
// Author: clover
// Video: https://www.youtube.com/watch?v=GnUEAapUSjI
// Source: https://app.crackingthecryptic.com/sudoku/3D4p249g4g

// Normal sudoku rules apply (standard 3x3 boxes, no jigsaw). White dots are
// drawn between exactly the listed adjacent pairs; the rules state that
// undrawn pairs carry no information, so no negative (Strict Kropki)
// constraint is added.

const givens = [
  ['R2C5', 1],
  ['R4C8', 4],
  ['R6C2', 2],
  ['R8C5', 6],
].map(([cell, value]) => new Given(cell, value));

const whiteDots = [
  ['R1C1', 'R2C1'],
  ['R2C1', 'R3C1'],
  ['R1C3', 'R2C3'],
  ['R2C3', 'R3C3'],
  ['R1C7', 'R1C8'],
  ['R1C8', 'R1C9'],
  ['R3C7', 'R3C8'],
  ['R3C8', 'R3C9'],
  ['R3C5', 'R3C6'],
  ['R3C5', 'R4C5'],
  ['R5C3', 'R6C3'],
  ['R5C4', 'R5C5'],
  ['R5C5', 'R5C6'],
  ['R4C7', 'R5C7'],
  ['R7C7', 'R8C7'],
  ['R8C7', 'R9C7'],
  ['R7C9', 'R8C9'],
  ['R8C9', 'R9C9'],
  ['R7C1', 'R7C2'],
  ['R7C2', 'R7C3'],
  ['R9C1', 'R9C2'],
  ['R9C2', 'R9C3'],
  ['R6C5', 'R7C5'],
  ['R7C4', 'R7C5'],
].map((cells) => new WhiteDot(...cells));

return [
  new Shape('9x9'),
  ...givens,
  ...whiteDots,
];
