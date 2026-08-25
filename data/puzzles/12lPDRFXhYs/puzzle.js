// Title: T-Rex
// Author: Macrovius
// Video: https://www.youtube.com/watch?v=12lPDRFXhYs
// Source: https://app.crackingthecryptic.com/webapp/8qmgb9hdJR

// Classic sudoku: standard row/column/box constraints plus the givens below.
// The payload carries no additional clue geometry (no lines, cages, arrows)
// and no rules text, so nothing beyond the givens is encoded.
return [
  new Shape('9x9'),
  new Given('R1C1', 8), new Given('R1C7', 2),
  new Given('R2C2', 1), new Given('R2C8', 9),
  new Given('R3C3', 3), new Given('R3C9', 8),
  new Given('R4C3', 1), new Given('R4C4', 7), new Given('R4C9', 3),
  new Given('R5C2', 9), new Given('R5C5', 1), new Given('R5C8', 6),
  new Given('R6C1', 5), new Given('R6C5', 2), new Given('R6C7', 1),
  new Given('R7C3', 7), new Given('R7C5', 6), new Given('R7C9', 4),
  new Given('R8C2', 6), new Given('R8C5', 9), new Given('R8C8', 1),
  new Given('R9C1', 4), new Given('R9C6', 8), new Given('R9C7', 5),
];
