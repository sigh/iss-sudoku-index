// Title: Apr 22, 2022: XV Killer Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=W5F2S7JpTgs
// Source: https://tinyurl.com/2p926emc

// Normal sudoku rules apply (default row/column/box regions, no givens).
// Each killer cage: digits distinct, sum to the printed total.
// Each XV mark: the two cells sum to 5 (V) or 10 (X). The rules only
// constrain marked pairs -- there is no "every 5/10 pair is marked" clause,
// so unmarked adjacent pairs are unconstrained (no StrictXV).

return [
  new Shape('9x9'),

  // Killer cages, as drawn on the grid.
  new Cage(4, 'R2C1', 'R2C2'),
  new Cage(7, 'R2C3', 'R2C4'),
  new Cage(3, 'R8C6', 'R8C7'),
  new Cage(8, 'R8C8', 'R8C9'),
  new Cage(5, 'R1C8', 'R2C8'),
  new Cage(8, 'R3C8', 'R4C8'),
  new Cage(6, 'R6C2', 'R7C2'),
  new Cage(7, 'R8C2', 'R9C2'),
  new Cage(12, 'R6C8', 'R6C9'),
  new Cage(10, 'R1C6', 'R2C6'),
  new Cage(7, 'R8C4', 'R9C4'),
  new Cage(12, 'R4C1', 'R4C2'),
  new Cage(5, 'R4C6', 'R5C6'),
  new Cage(8, 'R4C4', 'R4C5'),
  new Cage(15, 'R5C4', 'R6C4'),
  new Cage(12, 'R6C5', 'R6C6'),

  // XV marks, as drawn on the grid.
  new V('R2C2', 'R2C3'),
  new V('R8C8', 'R8C7'),
  new X('R2C8', 'R3C8'),
  new X('R8C2', 'R7C2'),
  new X('R4C5', 'R4C6'),
  new X('R5C4', 'R4C4'),
  new X('R6C4', 'R6C5'),
  new X('R6C6', 'R5C6'),
  new X('R5C9', 'R6C9'),
  new X('R4C1', 'R5C1'),
];
