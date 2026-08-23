// Title: Killer Sudoku X
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=GoeKVoK0qFM
// Source: https://app.crackingthecryptic.com/sudoku/P9hRgD9393

// Normal sudoku rules apply. Both main diagonals are drawn in blue and
// forbid repeats. Cages sum to the small clue in their top-left corner
// (when given) and forbid repeats within the cage; the one cage with no
// printed total still forbids repeats.

return [
  new Shape('9x9'),

  new Diagonal(-1),
  new Diagonal(1),

  new Cage(6, 'R2C3', 'R2C4', 'R3C4'),
  new Cage(12, 'R3C6', 'R2C6', 'R2C7'),
  new Cage(7, 'R3C8', 'R4C8', 'R4C7'),
  new Cage(20, 'R3C2', 'R4C2', 'R4C3'),
  new Cage(9, 'R6C3', 'R6C2', 'R7C2'),
  new Cage(16, 'R8C3', 'R8C4', 'R7C4'),
  new Cage(8, 'R7C6', 'R8C6', 'R8C7'),
  // No printed total: still a real cage, so only the no-repeat constraint applies.
  new Cage('', 'R6C7', 'R6C8', 'R7C8'),

  new Given('R4C4', 6),
  new Given('R5C5', 9),
  new Given('R6C6', 7),
];
