// Title: Let's Sausage!
// Author: Scojo
// Video: https://www.youtube.com/watch?v=hGCEG4_r9iI
// Source: https://sudokupad.app/27z6ar78be
//
// Normal sudoku. Standard boxes. Three givens: R3C8=4, R6C2=5, R8C9=6.
//
// Omitted: the "sausage chain" rule (linked groups of cells whose sausage
// sums must differ, chain to chain, by the sausage count of that chain).
// The puzzle's stored geometry only carries the sausage artwork as
// freehand SVG curves in a pixel space unrelated to the grid's cell-index
// coordinate system, plus a set of small edge/corner marker dots. Neither
// a shared-cell chain-of-dominoes reading nor a single-cell chain-of-links
// reading of the marker dots reproduces the known solution's sausage-sum
// differences (checked exhaustively over every diagonal resolution of the
// corner-type markers), so the exact sausage/chain cell membership could
// not be recovered.

return [
  new Shape('9x9'),
  new Given('R3C8', 4),
  new Given('R6C2', 5),
  new Given('R8C9', 6),
];
