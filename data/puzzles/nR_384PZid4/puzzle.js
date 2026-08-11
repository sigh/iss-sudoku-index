// Title: Pointer
// Author: Pwootjuhs
// Video: https://www.youtube.com/watch?v=nR_384PZid4
// Source: https://app.crackingthecryptic.com/sudoku/Gq7rqdb22G

// Normal sudoku (9x9, standard boxes, digits 1-9, no givens). Digits on an
// arrow sum to the digit in its circle (Arrow: first cell is the circle,
// remaining cells are the arm; repeats along the arm are allowed unless
// forced otherwise by row/column/box). Digits on a purple line form a
// consecutive, non-repeating run in any order (Renban).
//
// Two arrows share one circle cell (R3C4): they are two independent Arrow
// constraints, each arm summing to the R3C4 digit on its own.

const arrows = [
  ['R9C9', 'R8C9', 'R7C8', 'R7C7'],
  ['R4C9', 'R5C9', 'R6C9'],
  ['R4C4', 'R3C3', 'R2C2', 'R1C1'],
  ['R3C4', 'R2C3', 'R1C2'],
  ['R3C4', 'R4C5', 'R5C5'],
  ['R4C1', 'R5C2', 'R6C2', 'R6C3'],
].map(cells => new Arrow(...cells));

const renbans = [
  ['R1C7', 'R1C8', 'R1C9'],
  ['R3C7', 'R3C8', 'R3C9'],
  ['R3C4', 'R2C4', 'R2C3'],
  ['R2C2', 'R3C1', 'R4C2', 'R5C3', 'R4C4'],
  ['R6C3', 'R5C4', 'R6C5'],
  ['R6C4', 'R7C4'],
  ['R8C4', 'R9C4'],
  ['R8C2', 'R8C3'],
  ['R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9'],
].map(cells => new Renban(...cells));

return [
  new Shape('9x9'),
  ...arrows,
  ...renbans,
];
