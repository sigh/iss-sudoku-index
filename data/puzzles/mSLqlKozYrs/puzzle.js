// Title: Matching
// Author: Emre Kolotoglu
// Video: https://www.youtube.com/watch?v=mSLqlKozYrs
// Source: https://app.crackingthecryptic.com/sudoku/qgnrth64HH

// Standard 3x3-box sudoku, 16 two-cell killer cages (sum 9 on the left half
// of the grid, sum 10 on the right half), plus a global anti-knight
// constraint. Cage sum totals do not depend on which listed cell is the
// drawn top-left.

const cages = [
  // Sum-9 cages (left side).
  new Cage(9, 'R1C2', 'R1C3'),
  new Cage(9, 'R2C1', 'R2C2'),
  new Cage(9, 'R3C1', 'R3C2'),
  new Cage(9, 'R4C2', 'R4C3'),
  new Cage(9, 'R5C1', 'R5C2'),
  new Cage(9, 'R6C2', 'R6C3'),
  new Cage(9, 'R7C2', 'R7C3'),
  new Cage(9, 'R8C1', 'R8C2'),

  // Sum-10 cages (right side).
  new Cage(10, 'R2C8', 'R2C9'),
  new Cage(10, 'R3C7', 'R3C8'),
  new Cage(10, 'R4C7', 'R5C7'),
  new Cage(10, 'R4C9', 'R5C9'),
  new Cage(10, 'R5C8', 'R6C8'),
  new Cage(10, 'R7C8', 'R7C7'),
  new Cage(10, 'R7C9', 'R8C9'),
  new Cage(10, 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...cages,
  new AntiKnight(),
];
