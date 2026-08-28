// Title: One-Two Sudoku
// Author: Rain
// Video: https://www.youtube.com/watch?v=asfGvGhrtrc
// Source: https://cracking-the-cryptic.web.app/sudoku/JmhgFTmJd7

// Standard sudoku (rows, columns and boxes all-different, from the default
// 9x9 Shape) plus the single given R9C8=6.
//
// The puzzle also carries 28 short coloured strokes, each drawn across the
// boundary between two cells: 14 orange (#EB7532, 5 on a shared edge and 9
// across a shared corner, relating the two diagonally adjacent cells) and 14
// blue (#34BBE6, all on a shared edge). Which two cells each stroke relates
// is settled by the art, but no rules text accompanies this puzzle and
// nothing drawn on it says what an orange or a blue stroke asserts about its
// pair, nor whether unmarked pairs are constrained too. All 28 are therefore
// omitted, and this encoding is far weaker than the puzzle.

return [
  new Shape('9x9'),

  new Given('R9C8', 6),
];
