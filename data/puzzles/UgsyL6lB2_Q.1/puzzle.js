// Title: 5/27/23: Stare Into The Noid
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=UgsyL6lB2_Q
// Source: https://tinyurl.com/4pyh6fx3

// Normal sudoku rules apply (default row/column/box all-different, unmodified).
// Killer: digits in a cage cannot repeat and must sum to the given total.
// Each cage below is a two-cell domino; cage cells are pairwise disjoint, so
// each Cage's built-in all-different needs no help beyond the shared box/
// row/column constraints already enforced by Shape.

return [
  new Shape('9x9'),

  new Cage(7, 'R1C3', 'R2C3'),
  new Cage(6, 'R3C8', 'R3C9'),
  new Cage(7, 'R8C7', 'R9C7'),
  new Cage(6, 'R7C1', 'R7C2'),
  new Cage(6, 'R3C3', 'R3C4'),
  new Cage(7, 'R3C7', 'R4C7'),
  new Cage(6, 'R7C6', 'R7C7'),
  new Cage(7, 'R6C3', 'R7C3'),
  new Cage(8, 'R1C4', 'R2C4'),
  new Cage(8, 'R8C6', 'R9C6'),
  new Cage(8, 'R4C8', 'R4C9'),
  new Cage(8, 'R6C1', 'R6C2'),
  new Cage(3, 'R8C8', 'R8C9'),
  new Cage(15, 'R8C3', 'R8C4'),
  new Cage(4, 'R8C2', 'R9C2'),
  new Cage(16, 'R3C2', 'R4C2'),
  new Cage(3, 'R2C1', 'R2C2'),
  new Cage(13, 'R2C6', 'R2C7'),
  new Cage(4, 'R1C8', 'R2C8'),
  new Cage(14, 'R6C8', 'R7C8'),
  new Cage(14, 'R4C4', 'R5C4'),
  new Cage(10, 'R5C6', 'R6C6'),
];
