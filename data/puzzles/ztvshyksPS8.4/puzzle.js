// Title: Kropki 6x6 Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=ztvshyksPS8
// Source: https://app.crackingthecryptic.com/sudoku/FrTbGnTHGt

// Standard 6x6 sudoku (rows/columns/2x3 boxes), no givens.
// White dots: the two cells hold consecutive digits.
// Black dots: one cell's digit is exactly twice the other's.
// Rules state "not all possible circles are given", so unmarked adjacent
// pairs carry no information -- only the drawn dots below are constrained.

// Kropki dot edges (edge-sized rounded overlay marks in the source).
const whiteDotEdges = [
  ['R5C4', 'R5C5'],
];

const blackDotEdges = [
  ['R6C3', 'R6C4'],
  ['R4C4', 'R4C5'],
  ['R3C3', 'R4C3'],
  ['R2C2', 'R3C2'],
  ['R2C3', 'R2C4'],
  ['R2C5', 'R2C6'],
];

return [
  new Shape('6x6'),

  ...whiteDotEdges.map(([a, b]) => new WhiteDot(a, b)),
  ...blackDotEdges.map(([a, b]) => new BlackDot(a, b)),
];
