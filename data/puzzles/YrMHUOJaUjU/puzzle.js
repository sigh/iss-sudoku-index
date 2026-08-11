// Title: Swirling fifteen
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=YrMHUOJaUjU
// Source: https://app.crackingthecryptic.com/sudoku/Dn29B36q78

// Normal sudoku rules apply (standard 3x3 box regions, as drawn).
// Every drawn cage's digits sum to 15 and are distinct within the cage; none of
// the 16 cages carries a printed total, so the rules sentence supplies "15" for
// all of them.
// The central 3x3 box (grey, R4-6C4-6 -- already a standard sudoku box) is
// semi-magic: its 3 rows and its 3 columns each sum to 15. Its 2 diagonals are
// explicitly exempted ("do not necessarily sum to 15"), so only the 6 row/column
// sums are encoded, not a full 8-line magic square.

return [
  new Shape('9x9'),

  new Given('R3C3', 2),
  new Given('R6C6', 3),
  new Given('R8C7', 4),

  // Cages (drawn borders, no printed totals; see rules note above).
  new Cage(15, 'R1C2', 'R1C3'),
  new Cage(15, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(15, 'R4C1', 'R4C2', 'R4C3'),
  new Cage(15, 'R5C3', 'R6C3'),
  new Cage(15, 'R7C1', 'R8C1'),
  new Cage(15, 'R9C1', 'R9C2', 'R9C3'),
  new Cage(15, 'R7C4', 'R8C4', 'R9C4'),
  new Cage(15, 'R7C5', 'R7C6'),
  new Cage(15, 'R9C7', 'R9C8'),
  new Cage(15, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(15, 'R6C7', 'R6C8', 'R6C9'),
  new Cage(15, 'R4C7', 'R5C7'),
  new Cage(15, 'R2C9', 'R3C9'),
  new Cage(15, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(15, 'R1C6', 'R2C6', 'R3C6'),
  new Cage(15, 'R3C4', 'R3C5'),

  // Semi-magic center box: each row and column of the box sums to 15.
  new Sum(15, 'R4C4', 'R4C5', 'R4C6'),
  new Sum(15, 'R5C4', 'R5C5', 'R5C6'),
  new Sum(15, 'R6C4', 'R6C5', 'R6C6'),
  new Sum(15, 'R4C4', 'R5C4', 'R6C4'),
  new Sum(15, 'R4C5', 'R5C5', 'R6C5'),
  new Sum(15, 'R4C6', 'R5C6', 'R6C6'),
];
