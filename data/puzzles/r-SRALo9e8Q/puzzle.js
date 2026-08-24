// Title: X
// Author: Gliperal
// Video: https://www.youtube.com/watch?v=r-SRALo9e8Q
// Source: https://app.crackingthecryptic.com/sudoku/m6JLP2B72M

// Standard 9x9 sudoku (rows/columns/3x3 boxes), no givens.
// Quadruple circles: every listed digit must appear in at least one of the
// four cells touching that circle -> Quad(topLeftCell, ...digits).
// Consecutive dots (small unlabelled circles): the two linked cells hold
// consecutive digits, and only the drawn pairs are constrained (the rules
// do not claim every consecutive pair is marked) -> WhiteDot(a, b).

// Quadruple circles: [top-left cell of the 2x2, ...digits shown in the
// circle]. Transcribed from the corner circle text drawn on the board.
const quads = [
  ['R1C3', 3, 8],
  ['R1C6', 1, 2, 3],
  ['R2C2', 8],
  ['R2C7', 7],
  ['R3C1', 4, 5, 6],
  ['R3C8', 4, 7, 9],
  ['R6C1', 6, 7, 9],
  ['R6C8', 1, 4],
  ['R7C2', 2],
  ['R7C7', 6],
  ['R8C3', 1, 3, 8],
  ['R8C6', 1, 2, 5],
];

// Consecutive dot edges (edge-sized rounded overlay marks on the board).
const consecutiveDots = [
  ['R2C5', 'R3C5'],
  ['R5C2', 'R5C3'],
  ['R5C7', 'R5C8'],
  ['R7C5', 'R8C5'],
];

return [
  new Shape('9x9'),

  ...quads.map(([cell, ...digits]) => new Quad(cell, ...digits)),

  ...consecutiveDots.map(([a, b]) => new WhiteDot(a, b)),
];
