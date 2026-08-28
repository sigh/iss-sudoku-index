// Title: Odd Antidiagonal Knight Snake
// Author: Stephen Jones
// Video: https://www.youtube.com/watch?v=k9D-RJYbmrs
// Source: https://cracking-the-cryptic.web.app/sudoku/rNLJPPB9d3

// Encoded: normal sudoku (rows, columns and the nine ordinary 3x3 boxes all
// different, from the default 9x9 Shape) and the nine givens.
//
// Omitted: everything the two full-length light-grey diagonal strokes require.
// No rules text accompanies this puzzle, so the strokes' meaning is not
// recoverable: the same grey full-diagonal stroke is drawn for "all nine digits
// on the diagonal differ" and for "the diagonal holds only three different
// digits", which are incompatible, and the drawing carries nothing -- no second
// colour, no marker, no legend -- that tells them apart. Any further rule the
// puzzle has beyond the drawn strokes is likewise unstated and unencoded.

return [
  new Shape('9x9'),

  // Given digits, as printed in the grid.
  new Given('R1C7', 6),
  new Given('R2C7', 4),
  new Given('R3C2', 9),
  new Given('R3C6', 1),
  new Given('R3C9', 2),
  new Given('R8C1', 7),
  new Given('R9C3', 4),
  new Given('R9C5', 3),
  new Given('R9C6', 6),
];
