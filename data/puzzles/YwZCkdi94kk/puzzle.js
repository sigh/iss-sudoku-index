// Title: Tic Tac Toe Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=YwZCkdi94kk
// Source: https://cracking-the-cryptic.web.app/sudoku/Gf2M6rQgFJ

// Normal sudoku rules apply: row, column and 3x3-box all-different, which is
// the default 9x9 baseline (no NoBoxes/RegionSize override -- the source uses
// the standard boxes).
//
// OMITTED: the nine grey three-cell lines, one along a diagonal of each box
// (R3C1-R2C2-R1C3, R1C4-R2C5-R3C6, R3C7-R2C8-R1C9, R4C1-R5C2-R6C3,
// R4C6-R5C5-R6C4, R4C7-R5C8-R6C9, R9C1-R8C2-R7C3, R7C4-R8C5-R9C6,
// R9C7-R8C8-R7C9). The source states no rule for them: it carries no rules
// text, no legend, and no bulb, arrowhead or circle that would identify the
// line type, and all nine strokes are drawn alike. Several readings (sum,
// difference, palindrome, set) fit the drawing equally, so no line constraint
// is encoded and the puzzle below is under-constrained relative to the
// original.

// Givens, transcribed from the source's 20 filled cells.
const givens = {
  R1C1: 8, R1C5: 7, R1C7: 9,
  R2C6: 5,
  R3C3: 7, R3C4: 6, R3C9: 3,
  R4C3: 2, R4C4: 7, R4C8: 1,
  R5C1: 5, R5C9: 6,
  R6C2: 1, R6C6: 6,
  R7C1: 9, R7C7: 2,
  R8C4: 1,
  R9C3: 8, R9C5: 5, R9C9: 7,
};

return [
  new Shape('9x9'),
  ...Object.entries(givens).map(([cell, value]) => new Given(cell, value)),
];
