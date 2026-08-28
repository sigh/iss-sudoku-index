// Title: Mar. 12, 2022: Lickable Sudoku
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=XUQkX8NiRXw
// Source: https://tinyurl.com/2s4an8kd

// Normal sudoku rules apply. Digits in orthogonally adjacent cells cannot be
// consecutive -> AntiConsecutive, the global orthogonal-adjacency rule
// (payload carries this as the native `nonconsecutive: true` flag, no drawn
// dots or other per-pair geometry).

const givens = [
  new Given('R1C2', 1), new Given('R1C8', 6),
  new Given('R2C4', 9), new Given('R2C6', 7),
  new Given('R3C2', 3), new Given('R3C8', 4),
  new Given('R5C1', 8), new Given('R5C3', 6), new Given('R5C7', 1), new Given('R5C9', 7),
  new Given('R7C2', 4), new Given('R7C8', 9),
  new Given('R8C4', 4), new Given('R8C6', 2),
  new Given('R9C2', 6), new Given('R9C8', 7),
];

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  ...givens,
];
