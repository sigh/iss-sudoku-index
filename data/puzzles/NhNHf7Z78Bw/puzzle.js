// Title: I've Got a Secret
// Author: Eclectic Hoosier
// Video: https://www.youtube.com/watch?v=NhNHf7Z78Bw
// Source: https://app.crackingthecryptic.com/sudoku/nnDBmprdLN

// Standard 9x9 sudoku, no givens. Both main diagonals carry no-repeat.
// Six no-total cages forbid repeated digits only. One arrow: pill R1C1/R1C2
// (read left to right) holds the two-digit sum of the row-2 arm R2C1..R2C9
// -> PillArrow(2, tensCell, onesCell, ...armCells). White dots are Kropki
// consecutive, black dots are 1:2 ratio; "not all dots are given" means
// unmarked pairs are unconstrained, so no negative (Strict) form is used.

const cages = [
  ['R1C3', 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R3C2', 'R3C3'],
  ['R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C7', 'R3C8', 'R3C9', 'R4C7', 'R4C9'],
  ['R3C5', 'R4C4', 'R4C5', 'R4C6', 'R5C2', 'R5C3', 'R5C4', 'R5C5', 'R6C4'],
  ['R4C1', 'R4C2', 'R5C1', 'R6C1', 'R6C2', 'R6C3', 'R7C2', 'R7C3', 'R8C2'],
  ['R7C1', 'R7C4', 'R8C1', 'R8C3', 'R8C4', 'R9C1', 'R9C2', 'R9C3', 'R9C4'],
  ['R4C8', 'R5C8', 'R5C9', 'R6C6', 'R6C7', 'R6C8', 'R7C6', 'R8C6', 'R9C6'],
];

const whiteDotEdges = [
  ['R4C4', 'R4C5'],
  ['R8C3', 'R8C4'],
  ['R8C6', 'R9C6'],
  ['R8C8', 'R9C8'],
];

const blackDotEdges = [
  ['R5C5', 'R5C6'],
  ['R5C2', 'R5C3'],
  ['R8C1', 'R8C2'],
];

return [
  new Shape('9x9'),

  new Diagonal(1),
  new Diagonal(-1),

  ...cages.map(cells => new AllDifferent(...cells)),

  new PillArrow(2, 'R1C1', 'R1C2',
    'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
];
