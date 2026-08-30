// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=TKViWik7n1g
// Source: https://cracking-the-cryptic.web.app/sudoku/g4MJRgrG28

// Normal sudoku rules apply: standard 3x3 boxes (confirmed against the
// payload's `regions` array). No givens. Killer cages: cells in a cage hold
// distinct digits summing to the printed total. `metadata.rules` and the
// video description carry no rules text beyond the puzzle link, so this is
// the full ruleset the payload supports.

return [
  new Shape('9x9'),

  // Cages: cell lists and totals transcribed from the drawn `cages` array
  // (a full 25-cage partition of the grid, no overlaps).
  new Cage(11, 'R1C1', 'R1C2'),
  new Cage(9, 'R1C3', 'R2C3'),
  new Cage(19, 'R1C4', 'R1C5', 'R2C4'),
  new Cage(13, 'R1C6', 'R1C7'),
  new Cage(35, 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R3C7', 'R4C6', 'R4C7'),
  new Cage(11, 'R2C1', 'R3C1'),
  new Cage(10, 'R2C2', 'R3C2'),
  new Cage(11, 'R2C5', 'R2C6'),
  new Cage(26, 'R2C9', 'R3C8', 'R3C9', 'R4C8', 'R4C9'),
  new Cage(45, 'R3C3', 'R3C4', 'R4C4', 'R4C5', 'R5C5', 'R6C4', 'R6C5', 'R7C3', 'R7C4'),
  new Cage(9, 'R3C5', 'R3C6'),
  new Cage(28, 'R4C1', 'R5C1', 'R5C2', 'R6C1'),
  new Cage(21, 'R4C2', 'R4C3', 'R5C3', 'R5C4', 'R6C2', 'R6C3'),
  new Cage(9, 'R5C6', 'R5C7'),
  new Cage(11, 'R5C8', 'R5C9'),
  new Cage(33, 'R6C6', 'R6C7', 'R7C7', 'R8C7', 'R8C8', 'R9C8', 'R9C9'),
  new Cage(23, 'R6C8', 'R6C9', 'R7C8', 'R7C9', 'R8C9'),
  new Cage(7, 'R7C1', 'R8C1'),
  new Cage(12, 'R7C2', 'R8C2'),
  new Cage(5, 'R7C5', 'R7C6'),
  new Cage(12, 'R8C3', 'R9C3'),
  new Cage(16, 'R8C4', 'R9C4', 'R9C5'),
  new Cage(11, 'R8C5', 'R8C6'),
  new Cage(5, 'R9C1', 'R9C2'),
  new Cage(13, 'R9C6', 'R9C7'),
];
