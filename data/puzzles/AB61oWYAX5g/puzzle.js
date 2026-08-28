// Title: Pentominous Sudoku
// Author: Shye
// Video: https://www.youtube.com/watch?v=AB61oWYAX5g
// Source: https://cracking-the-cryptic.web.app/sudoku/PbmLMptRLN

// Rules encoded here:
//   Normal sudoku rules apply (default 9x9 boxes, confirmed against the
//   payload's region array, which is the usual nine 3x3 blocks).
//   The four printed givens.
// Omitted: the whole pentomino tiling and its downstream digit rules. Apart
// from the centre cell, the grid must be fully tiled with an unknown number
// of pieces drawn from nine named free-pentomino shapes (any rotation or
// reflection, each shape reusable, no two same-shape pieces edge-adjacent),
// each shape carrying its own within-piece digit rule (L/U unique digits,
// N/T non-consecutive adjacency, P/V consecutive adjacency, W/Y unique
// digits summing to a multiple of 3, Z adjacency differing by more than 5).
// The tiling is undrawn -- the solver must discover both the region
// boundaries and each region's shape identity -- which is component-shape
// congruence over an unanchored, unbounded-count partition.

return [
  new Shape('9x9'),

  new Given('R3C4', 2),
  new Given('R4C7', 3),
  new Given('R6C6', 8),
  new Given('R7C6', 1),
];
