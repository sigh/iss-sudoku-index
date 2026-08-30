// Title: A Sudoku With Only 4 Given Digits?!
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=hAyZ9K2EBF0
// Source: https://cracking-the-cryptic.web.app/sudoku/2QM8JHJ4HB

// Normal sudoku rules apply (standard 3x3 boxes, drawn explicitly and
// coinciding with the default boxes). Both marked diagonals must also
// contain 1-9. Cells a knight's move apart cannot repeat a digit. The
// central 3x3 box must form a magic square.
//
// Diagonal(-1) is the drawn R1C1-R9C9 line; Diagonal(1) is the drawn
// R1C9-R9C1 line (ISS direction convention: -1 = '\', 1 = '/').
//
// Magic square: EqualSum over the central box's 3 rows, 3 columns and 2
// diagonals; combined with the box's own all-different (from the normal
// box rule) this forces the common sum to 15, the standard 1-9 magic
// constant.

return [
  new Shape('9x9'),

  // Givens -- the 4 printed digits.
  new Given('R4C1', 3),
  new Given('R4C2', 8),
  new Given('R4C3', 4),
  new Given('R9C9', 2),

  new Diagonal(-1),
  new Diagonal(1),

  new AntiKnight(),

  new EqualSum(
    ['R4C4', 'R4C5', 'R4C6'],
    ['R5C4', 'R5C5', 'R5C6'],
    ['R6C4', 'R6C5', 'R6C6'],
    ['R4C4', 'R5C4', 'R6C4'],
    ['R4C5', 'R5C5', 'R6C5'],
    ['R4C6', 'R5C6', 'R6C6'],
    ['R4C4', 'R5C5', 'R6C6'],
    ['R4C6', 'R5C5', 'R6C4'],
  ),
];
