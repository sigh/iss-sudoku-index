// Title: Maximal Anti-Killer
// Author: MadMahogany
// Video: https://www.youtube.com/watch?v=guBRvJk2RYY
// Source: https://cracking-the-cryptic.web.app/sudoku/JTRBpnJgp2

// Normal sudoku rules apply. Each of the 11 drawn cages sums to 10 with no
// repeated digit (Cage(10, ...) gives both the sum and the all-different
// requirement).
//
// Omitted: "No other potential 10-cages can be created in the grid" -- a
// global rule that no orthogonally-connected group of cells anywhere else in
// the grid, of the sizes the drawn cages use (2, 3, or 4 cells), may itself
// have all-different digits summing to 10. Not encoded.
// "Each of the given cages has at least one potential killer cage of size
// 10 overlapping it" is a solving/construction note, not a rule to enforce.

return [
  new Shape('9x9'),

  new Given('R1C8', 7),
  new Given('R4C5', 6),
  new Given('R5C2', 6),
  new Given('R5C6', 3),
  new Given('R5C8', 8),
  new Given('R5C9', 9),
  new Given('R6C4', 9),
  new Given('R8C2', 2),
  new Given('R8C9', 5),

  // Cages, as drawn.
  new Cage(10, 'R1C9', 'R2C9'),
  new Cage(10, 'R3C8', 'R3C9', 'R4C9', 'R4C8'),
  new Cage(10, 'R1C6', 'R2C6', 'R2C7'),
  new Cage(10, 'R1C3', 'R1C4', 'R1C5'),
  new Cage(10, 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Cage(10, 'R6C7', 'R6C6', 'R7C6'),
  new Cage(10, 'R3C4', 'R3C5'),
  new Cage(10, 'R7C2', 'R8C2', 'R8C3', 'R9C2'),
  new Cage(10, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(10, 'R7C5', 'R8C5'),
  new Cage(10, 'R7C8', 'R8C8', 'R8C7', 'R9C7'),
];
