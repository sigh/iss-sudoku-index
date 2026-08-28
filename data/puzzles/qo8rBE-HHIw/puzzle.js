// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qo8rBE-HHIw
// Source: https://cracking-the-cryptic.web.app/sudoku/9DB3pdFFJp

// Normal sudoku rules apply. Cages sum to the printed total and forbid
// repeats within the cage. All ten cages in the payload carry a total, so
// each is encoded as a Cage; no hidden/no-total cages are present.

return [
  new Shape('9x9'),

  // Cages: cell lists and totals from the drawn `cages` array.
  new Cage(26, 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R5C9'),
  new Cage(17, 'R5C1', 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Cage(18, 'R5C2', 'R6C2', 'R7C2', 'R7C3'),
  new Cage(16, 'R8C2', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(24, 'R8C3', 'R8C4', 'R8C5', 'R9C5'),
  new Cage(30, 'R5C3', 'R6C3', 'R6C4', 'R7C4', 'R7C5'),
  new Cage(20, 'R1C5', 'R2C5', 'R2C6', 'R2C7'),
  new Cage(27, 'R1C6', 'R1C7', 'R1C8', 'R2C8'),
  new Cage(28, 'R3C7', 'R3C8', 'R4C8', 'R5C8'),
  new Cage(24, 'R3C5', 'R3C6', 'R4C6', 'R4C7', 'R5C7'),
];
