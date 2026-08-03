// Title: Collider
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=0a2sUvhl-I4
// Source: https://app.crackingthecryptic.com/sudoku/qbr94BtQfJ

// Standard sudoku (Shape gives rows/cols/boxes) plus:
// - both diagonals (blue lines) are all-different.
// - killer-style 2x2 cages: no repeats, sum where shown.
// - a white circle requires each of its digit(s) to appear in at least one
//   of the four cells at that circle's corner (`Quad`).
// - a shaded-square cell must hold an even digit (candidate-restricting
//   `Given`).
// - a black dot is a 1:2 ratio between the two adjacent cells it sits
//   between (`BlackDot`).
// All clauses of the rules text are represented; no omissions.

return [
  new Shape('9x9'),

  // Diagonals (the two blue lines): anti-diagonal R1C9..R9C1 and main
  // diagonal R1C1..R9C9.
  new Diagonal(1),
  new Diagonal(-1),

  // 2x2 cages, killer-style (no repeats; sum where shown). Cells and sums
  // transcribed from the drawn cages.
  new Cage(13, 'R1C3', 'R1C4', 'R2C3', 'R2C4'),
  new Cage(13, 'R1C6', 'R1C7', 'R2C6', 'R2C7'),
  new Cage(13, 'R3C1', 'R3C2', 'R4C1', 'R4C2'),
  new Cage(13, 'R3C8', 'R3C9', 'R4C8', 'R4C9'),
  new Cage(13, 'R6C1', 'R6C2', 'R7C1', 'R7C2'),
  new Cage(13, 'R6C8', 'R6C9', 'R7C8', 'R7C9'),
  new Cage(13, 'R8C3', 'R8C4', 'R9C3', 'R9C4'),
  // Cage 8: same cage-drawing but no total shown -- a no-total cage is
  // plain all-different over its cells.
  new AllDifferent('R8C6', 'R8C7', 'R9C6', 'R9C7'),

  // White circles ("must appear in one of the surrounding four cells" ==
  // ISS `Quad`, anchored at the 2x2 square's top-left cell). Corners and
  // digits transcribed from the drawn circles.
  new Quad('R5C1', 6),
  new Quad('R8C6', 1, 2),

  // Shaded-square cells (drawn as light-grey filled squares) must be even.
  new Given('R2C2', 2, 4, 6, 8),
  new Given('R2C8', 2, 4, 6, 8),
  new Given('R8C2', 2, 4, 6, 8),
  new Given('R8C8', 2, 4, 6, 8),
  new Given('R5C4', 2, 4, 6, 8),

  // Black dots (drawn as small black marks centred on a cell edge): 1:2
  // ratio between the two adjacent cells.
  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R7C1', 'R7C2'),
  new BlackDot('R1C6', 'R2C6'),
  new BlackDot('R6C9', 'R7C9'),
];
