// Title: Bonus Linked Sudokus: No 3 (Even Sudoku)
// Author: Ashish Kumar
// Video: https://www.youtube.com/watch?v=IIgYPkOiXFU
// Source: https://cracking-the-cryptic.web.app/sudoku/2ndrQ7Q6fn

// Normal sudoku rules apply (standard rows/cols/boxes, added by default).
// All shaded cells must be even.
// This is puzzle 3 of a four-puzzle linked chain: the digits solved in the
// previous puzzle's circled cells are added as givens at the same coordinates
// here (the digits the video adds by hand at its start). This grid's own eight
// circles are the export markers for puzzle 4 -- they constrain nothing here,
// so they are not encoded.

// Printed givens, transcribed from the drawn grid.
const printedGivens = [
  ['R2C1', 4], ['R2C9', 6],
  ['R3C2', 9], ['R3C8', 1],
  ['R4C3', 2], ['R4C7', 9],
  ['R5C4', 3], ['R5C6', 9],
  ['R6C3', 5], ['R6C4', 2], ['R6C6', 6], ['R6C7', 1],
  ['R7C2', 6], ['R7C8', 7],
  ['R8C1', 2], ['R8C9', 1],
];

// Chain imports: the solved digits at the six circled cells of puzzle 2
// (https://www.youtube.com/watch?v=nou8ePiE9oM), placed at the same
// coordinates.
const importedGivens = [
  ['R1C4', 7], ['R1C6', 8], ['R2C5', 2],
  ['R8C5', 8], ['R9C4', 5], ['R9C6', 7],
];

// Shaded cells, transcribed from the grey square underlays drawn on the grid.
const evenCells = [
  'R3C1', 'R4C2', 'R5C3', 'R6C2', 'R7C1',
  'R3C9', 'R4C8', 'R5C7', 'R6C8', 'R7C9',
];

return [
  new Shape('9x9'),

  ...printedGivens.map(([cell, value]) => new Given(cell, value)),
  ...importedGivens.map(([cell, value]) => new Given(cell, value)),

  // ISS has no Odd/Even class; a parity clue is a restricted-value Given.
  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
