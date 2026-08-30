// Title: unknown
// Author: Thomas Snyder
// Video: https://www.youtube.com/watch?v=a-N9WmPiOcU
// Source: https://cracking-the-cryptic.web.app/sudoku/FFj73GGJQh
//
// Normal sudoku rules apply: standard 9x9 grid, nine 3x3 box regions, rows,
// columns and boxes each contain 1-9 once.
//
// The payload draws 22 small grey circles, each straddling the shared edge of
// two orthogonally adjacent cells (a Kropki-dot-style pairwise mark), but
// carries no rules text stating what a grey dot means -- grey is neither of
// the conventional Kropki colours (white=consecutive, black=ratio). The dot
// rule is therefore omitted entirely from this encoding.

const givens = [
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

return [
  new Shape('9x9'),
  ...givens,
];
