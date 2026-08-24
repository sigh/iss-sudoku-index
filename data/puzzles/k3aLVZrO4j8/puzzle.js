// Title: Anti-Knight Magic Square Sudoku
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=k3aLVZrO4j8
// Source: https://app.crackingthecryptic.com/sudoku/jMnJTDq86t
//
// Rules encoded: normal sudoku (rows/columns/boxes all-different, boxes are
// the payload's own standard 3x3 regions); identical digits cannot be a
// knight's move apart (AntiKnight); the central (blue) 3x3 box R4C4-R6C6 is
// a magic square, i.e. its 3 rows, 3 columns, and 2 diagonals all sum equal
// (EqualSum) -- the box's own all-different (from the standard region) then
// forces that common sum to 15 without needing it stated explicitly.
// No rule is omitted.

return [
  new Shape('9x9'),

  // Givens, transcribed from payload `cells`.
  new Given('R1C1', 4), new Given('R1C3', 3), new Given('R1C9', 9),
  new Given('R2C5', 1),
  new Given('R3C3', 6), new Given('R3C8', 5),
  new Given('R4C1', 8),
  new Given('R6C9', 2),
  new Given('R7C2', 9), new Given('R7C7', 1),
  new Given('R8C5', 2),
  new Given('R9C1', 1), new Given('R9C7', 7), new Given('R9C9', 4),

  new AntiKnight(),

  // Central box magic square: 3 rows, 3 columns, 2 diagonals of R4C4-R6C6.
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
