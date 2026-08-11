// Title: Denver
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=hxuUUvEOyZk
// Source: https://app.crackingthecryptic.com/sudoku/MHHnf7PDDQ

// Normal sudoku rules apply (rows, columns, boxes all-different, from the
// default Shape). The drawn blue diagonal runs R9C1 to R1C9 (bottom-left to
// top-right, i.e. ISS's '/' diagonal) and forbids repeats along it, even
// though the rules text labels it "the main diagonal". Eleven L-triomino
// cages each sum to 19 with no repeated digit inside the cage (Cage's
// default semantics). The cell with the grey circle (R6C4) must hold an odd
// digit -- a candidate restriction, not an Odd/Even class.

const cages = [
  ['R1C1', 'R2C1', 'R1C2'],
  ['R2C2', 'R3C2', 'R2C3'],
  ['R2C4', 'R3C4', 'R3C3'],
  ['R2C5', 'R3C5', 'R3C6'],
  ['R4C4', 'R4C5', 'R5C5'],
  ['R4C3', 'R5C3', 'R5C4'],
  ['R5C2', 'R6C2', 'R6C1'],
  ['R6C3', 'R7C3', 'R6C4'],
  ['R6C5', 'R7C5', 'R6C6'],
  ['R6C7', 'R7C7', 'R7C8'],
  ['R8C6', 'R9C6', 'R9C7'],
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  ...cages.map(cells => new Cage(19, ...cells)),
  new Given('R6C4', 1, 3, 5, 7, 9),
];
