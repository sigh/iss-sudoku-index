// Title: Bonus Linked Sudokus: No 2 (Even Sudoku)
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=nou8ePiE9oM
// Source: https://cracking-the-cryptic.web.app/sudoku/2h9P4rRb6M

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
// All shaded cells must be even.
// This is puzzle 2 of a four-puzzle linked chain: the digits solved at the
// previous puzzle's circled cells are added as givens at the same coordinates
// here (the digits the video adds by hand at its start). This grid's own six
// circles are the export markers for puzzle 3 -- they constrain nothing here,
// so they are not encoded.

// Printed givens, transcribed from the drawn grid.
const printedGivens = [
  ['R3C4', 3], ['R3C6', 9],
  ['R4C1', 1], ['R4C3', 9], ['R4C7', 5], ['R4C9', 2],
  ['R6C1', 6], ['R6C3', 4], ['R6C7', 3], ['R6C9', 9],
  ['R7C4', 2], ['R7C6', 6],
  ['R9C5', 4],
];

// Chain imports: the solved digits at the eight circled cells of puzzle 1
// (https://www.youtube.com/watch?v=WEDl2DAekZs), placed at the same
// coordinates.
const importedGivens = [
  ['R1C2', 1], ['R1C8', 9],
  ['R2C1', 9], ['R2C9', 5],
  ['R8C1', 5], ['R8C9', 7],
  ['R9C2', 9], ['R9C8', 3],
];

// Shaded cells, transcribed from the grey square underlays drawn on the grid.
const evenCells = [
  'R3C3', 'R3C7',
  'R4C4', 'R4C6',
  'R6C4', 'R6C6',
  'R7C3', 'R7C7',
];

return [
  new Shape('9x9'),

  ...printedGivens.map(([cell, value]) => new Given(cell, value)),
  ...importedGivens.map(([cell, value]) => new Given(cell, value)),

  // ISS has no Odd/Even class; a parity clue is a restricted-value Given.
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
