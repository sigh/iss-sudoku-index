// Title: Classic Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=wLGzDvAERsE
// Source: https://app.crackingthecryptic.com/Gg2pBG4hQD

// Rules: "Normal sudoku rules apply" -- standard row/column/box all-different
// on a 9x9 grid. The payload's regions array is the ordinary 3x3 box
// partition, so the default Shape('9x9') boxes already match it; no NoBoxes
// or custom regions are needed. No other clues are present.
//
// Givens transcribed from the source payload's cell values (row-major, 1-indexed R#C#).
return [
  new Shape('9x9'),
  new Given('R1C2', 2), new Given('R1C9', 5),
  new Given('R2C1', 6), new Given('R2C5', 1), new Given('R2C9', 8),
  new Given('R3C3', 7), new Given('R3C4', 8), new Given('R3C6', 6), new Given('R3C7', 1),
  new Given('R4C3', 9), new Given('R4C5', 3), new Given('R4C7', 4),
  new Given('R5C1', 4), new Given('R5C4', 9), new Given('R5C6', 2), new Given('R5C9', 6),
  new Given('R6C3', 2), new Given('R6C5', 6), new Given('R6C7', 9),
  new Given('R7C3', 6), new Given('R7C4', 4), new Given('R7C6', 3), new Given('R7C7', 8),
  new Given('R8C1', 2), new Given('R8C5', 8), new Given('R8C9', 1),
  new Given('R9C1', 5), new Given('R9C8', 3),
];
