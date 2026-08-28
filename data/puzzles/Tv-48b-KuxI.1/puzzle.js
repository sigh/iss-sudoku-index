// Title: A New Miracle Sudoku
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=Tv-48b-KuxI
// Source: https://cracking-the-cryptic.web.app/sudoku/897LqtfTQD

// Standard sudoku (rows, columns, boxes all-different, from the default 9x9
// Shape) plus the two givens. No other clue geometry -- no cages, lines,
// arrows, circles, shading or overlays -- is drawn on this puzzle.
//
// No rules text accompanies this puzzle. The video's own description
// introduces it as "Aad van de Wetering's new puzzle (his response to
// Mitchell Lee's miracle sudoku)", implying an additional "miracle" rule
// (king's-move and/or knight's-move non-repeat, and/or no consecutive digits
// in orthogonally adjacent cells) on top of ordinary sudoku, but nothing
// local states which one(s) apply, so that rule is omitted here.

return [
  new Shape('9x9'),

  // Givens, from the payload's two filled cells.
  new Given('R3C5', 4),
  new Given('R4C3', 3),
];
