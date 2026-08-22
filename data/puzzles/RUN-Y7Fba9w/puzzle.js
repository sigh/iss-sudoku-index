// Title: X Dots
// Author: Nahileon
// Video: https://www.youtube.com/watch?v=RUN-Y7Fba9w
// Source: https://app.crackingthecryptic.com/sudoku/bL4Nd3T6f2

// Standard sudoku plus: both main diagonals all-different (1-9 once each);
// black dots between adjacent cells hold a 1:2 ratio (not all dots given, so
// no exhaustiveness claim on unmarked pairs); two outside clues give the sum
// along a diagonal starting at the marked edge cell (repeats allowed there,
// since only the two main diagonals carry an all-different rule).

return [
  new Shape('9x9'),

  // Both main diagonals, corner to corner (drawn as two blue lines).
  // Diagonal(-1) is R1C1..R9C9 ('\'), Diagonal(1) is R9C1..R1C9 ('/').
  new Diagonal(-1),
  new Diagonal(1),

  // Black dots (2:1 ratio), one per drawn dot overlay.
  new BlackDot('R1C2', 'R1C3'),
  new BlackDot('R2C2', 'R2C3'),
  new BlackDot('R1C8', 'R2C8'),
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R4C8', 'R4C9'),
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R8C8', 'R8C9'),
  new BlackDot('R7C2', 'R8C2'),
  new BlackDot('R7C3', 'R8C3'),
  new BlackDot('R6C2', 'R6C3'),

  // Outside diagonal sums. Each badge's drawn arrow points into the grid,
  // fixing which of the two candidate diagonals through that edge cell it
  // labels (the badge position alone is equidistant between them).
  LittleKiller.fromCells(
    37, cellGraph('9x9').ray('R4C1', 1, 1), cellGeometry('9x9')),
  LittleKiller.fromCells(
    27, cellGraph('9x9').ray('R5C9', -1, -1), cellGeometry('9x9')),
];
