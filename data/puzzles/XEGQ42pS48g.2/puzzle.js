// Title: Untitled
// Author: Unknown
// Video: https://www.youtube.com/watch?v=XEGQ42pS48g
// Source: https://cracking-the-cryptic.web.app/sudoku/bfQg4LM6Gb

// Normal sudoku: rows, columns and 3x3 boxes each hold 1-9 once. The source
// states no rules text and draws no clue layer of any kind -- no cages, lines,
// arrows, circles, dots or shading -- so the 28 givens are its whole content
// and nothing is omitted here.
//
// The source's nine regions are the nine standard 3x3 boxes (listed box-column
// first), which Shape('9x9') already supplies, so no explicit region is added.

// The 28 filled cells of the drawn grid, read row by row.
const GIVENS = [
  ['R1C3', 2], ['R1C6', 1], ['R1C8', 4],
  ['R2C2', 5], ['R2C3', 1], ['R2C6', 4],
  ['R3C2', 4], ['R3C4', 2], ['R3C5', 6],
  ['R4C2', 1], ['R4C5', 4], ['R4C6', 5],
  ['R5C2', 3], ['R5C3', 6], ['R5C7', 5], ['R5C8', 1],
  ['R6C4', 3], ['R6C5', 1], ['R6C8', 2],
  ['R7C5', 2], ['R7C6', 6], ['R7C8', 5],
  ['R8C4', 4], ['R8C7', 3], ['R8C8', 6],
  ['R9C2', 2], ['R9C4', 1], ['R9C7', 4],
];

return [
  new Shape('9x9'),
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
];
