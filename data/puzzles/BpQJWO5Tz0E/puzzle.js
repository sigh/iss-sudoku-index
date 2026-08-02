// Title: Why Not?
// Author: EasilyAmused
// Video: https://www.youtube.com/watch?v=BpQJWO5Tz0E
// Source: https://app.crackingthecryptic.com/sudoku/QdpgbQfT39

// Normal Sudoku. Each dashed single-cell cage is friendly: its digit is its
// row number, column number, or row-major 3x3-box number.
return [
  new Shape('9x9'),
  // Candidate sets transcribed from the 25 drawn friendly-cell cages.
  new Given('R1C5', 1, 5, 2), new Given('R1C6', 1, 6, 2), new Given('R1C7', 1, 7, 3),
  new Given('R2C1', 2, 1), new Given('R2C4', 2, 4), new Given('R2C6', 2, 6), new Given('R2C9', 2, 9, 3),
  new Given('R3C1', 3, 1), new Given('R3C7', 3, 7),
  new Given('R4C1', 4, 1), new Given('R4C4', 4, 5), new Given('R4C6', 4, 6, 5), new Given('R4C8', 4, 8, 6), new Given('R4C9', 4, 9, 6),
  new Given('R5C1', 5, 1, 4), new Given('R5C7', 5, 7, 6),
  new Given('R6C2', 6, 2, 4), new Given('R6C4', 6, 4, 5),
  new Given('R7C1', 7, 1), new Given('R7C3', 7, 3), new Given('R7C7', 7, 9),
  new Given('R8C2', 8, 2, 7), new Given('R8C5', 8, 5),
  new Given('R9C2', 9, 2, 7), new Given('R9C6', 9, 6, 8),
];
