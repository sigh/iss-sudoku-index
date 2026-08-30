// Title: Unknown
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=j1MsBIgWdXw
// Source: https://cracking-the-cryptic.web.app/sudoku/76fRtBm9fp

// Normal sudoku rules apply. Cells a knight's move apart must not hold the
// same digit (AntiKnight).

const givens = [
  new Given('R1C2', 1),
  new Given('R2C3', 2),
  new Given('R3C4', 3),
  new Given('R4C1', 1),
  new Given('R4C5', 4),
  new Given('R5C2', 7),
  new Given('R5C6', 5),
  new Given('R6C3', 8),
  new Given('R6C7', 6),
  new Given('R7C4', 4),
  new Given('R7C8', 1),
  new Given('R9C1', 9),
  new Given('R9C3', 7),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKnight(),
];
