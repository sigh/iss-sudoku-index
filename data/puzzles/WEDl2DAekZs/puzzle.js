// Title: Even Sudoku
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=WEDl2DAekZs
// Source: https://cracking-the-cryptic.web.app/sudoku/Nnf6LhPGPG

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
// Digits in shaded (grey square) cells must be even -- encoded as a
// restricted-value Given, since ISS has no Odd/Even class. The 8 white,
// unfilled, textless corner circles in the payload carry no rules-text
// meaning and are decoration, so they are not encoded.

// Shaded cells (grey square underlays), transcribed from the payload's
// `underlays` array.
const evenCells = [
  'R1C3', 'R1C7', 'R2C2', 'R2C8', 'R3C1', 'R3C9',
  'R7C1', 'R7C9', 'R8C2', 'R8C8', 'R9C3', 'R9C7',
];

return [
  new Shape('9x9'),

  new Given('R1C5', 5),
  new Given('R2C4', 4),
  new Given('R2C6', 6),
  new Given('R3C3', 3),
  new Given('R3C7', 7),
  new Given('R4C2', 2),
  new Given('R4C4', 5),
  new Given('R4C6', 7),
  new Given('R4C8', 8),
  new Given('R5C1', 1),
  new Given('R5C9', 9),
  new Given('R6C2', 7),
  new Given('R6C4', 3),
  new Given('R6C6', 9),
  new Given('R6C8', 1),
  new Given('R7C3', 6),
  new Given('R7C7', 2),
  new Given('R8C4', 8),
  new Given('R8C6', 3),
  new Given('R9C5', 4),

  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
