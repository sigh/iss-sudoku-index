// Title: Arbitrary Code Execution
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=ihggWfW5wqM
// Source: https://app.crackingthecryptic.com/sudoku/MGBFPqRQTt

// Normal sudoku rules apply: no additional clues, cages, or lines. Regions
// are the default 3x3 boxes (the drawn region geometry matches them exactly).
const shape = new Shape('9x9');

// Givens transcribed from the drawn cell values.
const givens = [
  new Given('R2C6', 7),
  new Given('R3C2', 7), new Given('R3C3', 3), new Given('R3C4', 2),
  new Given('R3C6', 1), new Given('R3C8', 5), new Given('R3C9', 6),
  new Given('R4C2', 3), new Given('R4C3', 5), new Given('R4C5', 2),
  new Given('R4C6', 4), new Given('R4C7', 6), new Given('R4C8', 1),
  new Given('R5C1', 1), new Given('R5C3', 2), new Given('R5C4', 6),
  new Given('R5C6', 3), new Given('R5C7', 5), new Given('R5C9', 4),
  new Given('R6C1', 6), new Given('R6C2', 4), new Given('R6C4', 5),
  new Given('R6C5', 1), new Given('R6C8', 3), new Given('R6C9', 2),
  new Given('R7C1', 3), new Given('R7C2', 5), new Given('R7C4', 1),
  new Given('R7C6', 2), new Given('R7C7', 4), new Given('R7C8', 6),
  new Given('R8C4', 8),
];

return [
  shape,
  ...givens,
];
