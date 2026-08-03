// Title: Phoenix
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=av6pHRqzrsk
// Source: https://app.crackingthecryptic.com/sudoku/nPNp4LMHGQ

// Normal sudoku rules apply (default row/column/box all-different; boxes are
// the standard 3x3 regions, drawn explicitly in the payload and identical to
// the default). The drawn diagonal (R1C9-R9C1, the anti-diagonal) must
// contain all of the digits 1-9: with exactly 9 cells this is equivalent to
// all-different along it, so Diagonal(1) (the '/' direction, which ISS
// traces from R1C9 to R9C1) encodes it exactly. Each cage's digits sum to
// the small clue in its top-left cell and cannot repeat within the cage
// (Cage enforces both).

return [
  new Shape('9x9'),

  new Diagonal(1),

  // Cages: cell lists transcribed from the payload's `cages` array
  // (top-left cell first, matching where each total is drawn).
  new Cage(9, 'R1C2', 'R1C3'),
  new Cage(9, 'R1C7', 'R2C6', 'R2C7'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(9, 'R3C5', 'R4C5', 'R4C6'),
  new Cage(9, 'R3C8', 'R4C7', 'R4C8'),
  new Cage(22, 'R4C4', 'R5C3', 'R5C4'),
  new Cage(22, 'R5C6', 'R5C7', 'R6C6'),
  new Cage(9, 'R6C1', 'R6C2', 'R7C2'),
  new Cage(9, 'R6C4', 'R6C5', 'R7C5'),
  new Cage(9, 'R8C1', 'R9C1', 'R9C2'),
  new Cage(22, 'R8C3', 'R8C4', 'R9C3'),
  new Cage(9, 'R9C4', 'R9C5'),
];
