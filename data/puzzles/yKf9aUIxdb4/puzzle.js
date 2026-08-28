// Title: The Miracle Sudoku
// Author: Mitchell Lee
// Video: https://www.youtube.com/watch?v=yKf9aUIxdb4
// Source: https://cracking-the-cryptic.web.app/sudoku/tjN9LtrrTL

// Rules encoded here:
//   - Normal sudoku (rows, columns and the nine standard 3x3 boxes, all from
//     the default 9x9 Shape; the payload's regions array is exactly those
//     boxes).
//   - Cells a knight's move apart do not contain the same digit.
//   - Cells a king's move apart do not contain the same digit.
//   - Orthogonally adjacent cells do not contain consecutive digits.
//   - The two givens.
// Nothing else is drawn on the board.
//
// The puzzle's own payload carries no rules text. The three variant rules are
// as stated in the Interactive Sudoku Solver's worked example of this puzzle
// (js/sandbox/examples.js, "Create a miracle sudoku"), which cites this video
// URL and carries these same two givens; see the description for that
// provenance.

return [
  new Shape('9x9'),

  new AntiKnight(),
  new AntiKing(),
  new AntiConsecutive(),

  // Givens, from the payload's two filled cells.
  new Given('R5C3', 1),
  new Given('R6C7', 2),
];
