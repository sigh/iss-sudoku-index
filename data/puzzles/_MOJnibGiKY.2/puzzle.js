// Title: Sep 26, 2021: Odd Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=_MOJnibGiKY
// Source: https://tinyurl.com/vwtpauk9

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
// Digits placed in grey circles must be odd -- encoded as a restricted-value
// Given, since ISS has no Odd/Even class.

const oddCells = [
  'R2C2', 'R1C3', 'R2C4', 'R3C3', 'R4C2', 'R3C1', 'R1C5', 'R5C1',
  'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9', 'R7C9', 'R8C8', 'R9C7',
];

return [
  new Shape('9x9'),

  // Givens
  new Given('R1C6', 6),
  new Given('R1C8', 9),
  new Given('R2C7', 5),
  new Given('R2C9', 8),
  new Given('R3C6', 7),
  new Given('R3C8', 2),
  new Given('R4C5', 6),
  new Given('R4C7', 3),
  new Given('R4C9', 9),
  new Given('R5C4', 9),
  new Given('R5C6', 4),
  new Given('R6C3', 3),
  new Given('R6C5', 5),
  new Given('R7C2', 9),
  new Given('R7C4', 6),
  new Given('R8C1', 8),
  new Given('R8C3', 6),
  new Given('R9C1', 4),
  new Given('R9C2', 7),

  // Grey circles: digit must be odd.
  ...oddCells.map((cell) => new Given(cell, 1, 3, 5, 7, 9)),
];
