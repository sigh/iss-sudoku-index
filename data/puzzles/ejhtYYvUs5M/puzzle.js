// Title: White Room
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=ejhtYYvUs5M
// Source: https://app.crackingthecryptic.com/sudoku/6D4r2QfF7N

// Normal sudoku rules apply: rows, columns, and 3x3 boxes all-different,
// digits 1-9, no givens. Killer cages: digits in a cage sum to the small
// clue in its top-left cell and cannot repeat within the cage. Only 18 of
// the 81 cells are covered by a cage; the rest carry no cage constraint.
// Cage cells and totals transcribed from the puzzle's cage geometry.

return [
  new Shape('9x9'),

  new Cage(15, 'R6C9', 'R7C9'),
  new Cage(3, 'R9C6', 'R9C7'),
  new Cage(23, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(17, 'R7C3', 'R8C3'),
  new Cage(7, 'R2C2', 'R3C2', 'R4C2'),
  new Cage(5, 'R2C6', 'R2C7'),
  new Cage(6, 'R3C7', 'R3C8'),
  new Cage(6, 'R4C6', 'R4C7'),
];
