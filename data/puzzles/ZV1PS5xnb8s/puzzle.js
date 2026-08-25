// Title: Non-Consecutive Quad X Sudoku
// Author: Rhys Minchin
// Video: https://www.youtube.com/watch?v=ZV1PS5xnb8s
// Source: https://app.crackingthecryptic.com/webapp/29GpBRDJrN

// Normal sudoku (default row/col/box). AntiConsecutive: no two orthogonally
// adjacent cells hold consecutive digits, everywhere on the grid. X: the two
// cells at a marked edge sum to 10 -- only the three drawn edges are
// constrained, since not every summing-to-10 pair is marked. Quad(topLeftCell,
// ...values): each listed digit appears in the surrounding four cells; when
// the value count equals 4 this already forces an exact bijection (all four
// cells restricted to just those values, each required present), matching
// the rules text's "all the digits which are used". The one three-value quad
// (R6C6 corner) needs an explicit Given to also exclude every other digit,
// since Quad alone would only require 3, 5, 7 to be present and would not by
// itself bar a fourth distinct value from appearing too.

return [
  new Shape('9x9'),

  new AntiConsecutive(),

  // X marks (drawn edges; sum to 10). Coordinates from the overlay geometry.
  new X('R1C3', 'R1C4'),
  new X('R6C1', 'R7C1'),
  new X('R4C9', 'R5C9'),

  // Quad circles (corner geometry from the overlays).
  new Quad('R1C1', 1, 3, 4, 6),
  new Quad('R6C3', 1, 3, 6, 8),
  new Quad('R8C1', 1, 2, 5, 7),
  new Quad('R3C3', 1, 2, 5, 7),
  new Quad('R1C8', 1, 5, 7, 8),
  new Quad('R8C8', 2, 5, 6, 9),
  new Quad('R3C6', 4, 6, 7, 9),
  new Quad('R6C6', 3, 5, 7),
  // R6C6 quad only lists 3 digits; restrict its four cells to exactly
  // {3,5,7} so no other digit can appear there (Quad above still enforces
  // that each of 3,5,7 is present).
  new Given('R6C6', 3, 5, 7),
  new Given('R6C7', 3, 5, 7),
  new Given('R7C6', 3, 5, 7),
  new Given('R7C7', 3, 5, 7),
];
