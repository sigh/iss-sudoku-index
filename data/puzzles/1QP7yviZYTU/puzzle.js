// Title: Dotless Kropki Sudoku X
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=1QP7yviZYTU
// Source: https://app.crackingthecryptic.com/sudoku/rLNbnB6FnD

// Normal sudoku rules apply (default row/col/box all-different; the
// payload's 9 regions coincide with the default 3x3 boxes).
// The two main diagonals each contain every digit 1-9 exactly once.
// Dotless Kropki: no dot is drawn anywhere on the grid, and the rule is
// stated as a direct negative ("may not be ... nor may they be"), so every
// orthogonally adjacent pair in the grid is forbidden from being
// consecutive or in a 2:1 ratio. StrictKropki with zero WhiteDot/BlackDot
// instances is exactly this global negative.

return [
  new Shape('9x9'),
  new Given('R4C2', 1),
  new Given('R4C8', 2),
  new Given('R5C5', 4),
  new Diagonal(1),
  new Diagonal(-1),
  new StrictKropki(),
];
