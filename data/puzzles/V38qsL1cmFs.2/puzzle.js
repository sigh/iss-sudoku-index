// Title: Tatooine Sunset
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=V38qsL1cmFs
// Source: https://cracking-the-cryptic.web.app/sudoku/jHQR32FrfP

// Classic sudoku: standard rules only (no rules text in the payload). The
// payload's regions are exactly the nine standard 3x3 boxes, so the default
// Shape('9x9') row/column/box all-different baseline is a faithful encoding
// with no extra constraints. Givens transcribed from the puzzle's printed
// digits.

return [
  new Shape('9x9'),

  new Given('R2C3', 9), new Given('R2C4', 8), new Given('R2C9', 7),
  new Given('R3C2', 8), new Given('R3C5', 6), new Given('R3C8', 5),
  new Given('R4C2', 5), new Given('R4C5', 4), new Given('R4C8', 3),
  new Given('R5C3', 7), new Given('R5C4', 9), new Given('R5C9', 2),
  new Given('R7C3', 2), new Given('R7C4', 7), new Given('R7C9', 9),
  new Given('R8C2', 4), new Given('R8C5', 5), new Given('R8C8', 6),
  new Given('R9C1', 3), new Given('R9C6', 6), new Given('R9C7', 2),
];
