// Title: 2026 Killer
// Author: Florian Wortmann
// Video: https://www.youtube.com/watch?v=7rUzomyGHK4
// Source: https://sudokupad.app/9ra2ew24s8

// Normal sudoku rules apply.
// Digits may not repeat on the marked diagonal (bottom-left to top-right):
// same as Diagonal(1). The payload also draws this run of cells as a
// second, hidden, no-total cage with the all-different flag -- a duplicate
// encoding of the same rule, not a distinct constraint.
// Digits in a cage may not repeat and sum to the small number in the top
// left corner of the cage.

return [
  new Shape('9x9'),

  new Diagonal(1),

  new Cage(6, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(6, 'R5C1', 'R6C1'),
  new Cage(6, 'R1C5', 'R1C6'),
  new Cage(6, 'R9C1', 'R9C2'),
  new Cage(6, 'R1C9', 'R2C9'),
  new Cage(6, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(6, 'R3C8', 'R3C9'),
  new Cage(6, 'R8C3', 'R9C3'),
  new Cage(20, 'R2C2', 'R2C3', 'R3C3'),
  new Cage(20, 'R7C8', 'R8C7', 'R8C8'),
  new Cage(6, 'R6C3', 'R6C4', 'R7C4'),
  new Cage(6, 'R3C6', 'R4C6', 'R4C7'),
  new Cage(20, 'R3C4', 'R4C3', 'R4C4'),
  new Cage(20, 'R6C6', 'R6C7', 'R7C6'),
  new Cage(20, 'R4C8', 'R4C9', 'R5C8'),
  new Cage(20, 'R4C2', 'R5C2', 'R6C2'),
];
