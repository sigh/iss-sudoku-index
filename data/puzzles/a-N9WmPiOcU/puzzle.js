// Title: unknown
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=a-N9WmPiOcU
// Source: https://cracking-the-cryptic.web.app/sudoku/FFj73GGJQh

// Normal sudoku rules apply: each row, column and 3x3 box holds 1-9 once. The
// source's own nine regions are exactly the nine standard boxes, so no jigsaw
// regions are needed.
//
// The source also draws 22 identical small grey circles, each on the shared
// edge of an orthogonally adjacent cell pair -- a Kropki-style pairwise mark.
// It states no rules at all, so what relation such a circle asserts between
// its two digits is unknown: consecutive, a 1:2 ratio, a fixed sum and others
// are all live readings, nothing drawn tells them apart, and no circle touches
// a given cell. The circle rule is therefore omitted here in full, and only
// the givens and standard sudoku are encoded.

return [
  new Shape('9x9'),

  // The 12 printed digits.
  new Given('R1C5', 1),
  new Given('R1C9', 9),
  new Given('R2C6', 9),
  new Given('R2C7', 6),
  new Given('R3C8', 3),
  new Given('R4C9', 4),
  new Given('R6C1', 2),
  new Given('R7C2', 6),
  new Given('R8C3', 5),
  new Given('R8C4', 3),
  new Given('R9C1', 3),
  new Given('R9C5', 6),
];
