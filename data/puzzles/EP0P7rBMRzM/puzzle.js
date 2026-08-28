// Title: 4x4 Magic Square Sudoku
// Author: Cam Dennis
// Video: https://www.youtube.com/watch?v=EP0P7rBMRzM
// Source: https://cracking-the-cryptic.web.app/sudoku/3prpjHRNbf

// Encoded: normal sudoku rules and the 17 givens.
//
// Omitted: the 4x4 magic square. 16 cells carry a purple square underlay and
// form a 4x4 square rotated 45 degrees about R5C5 -- its rows are the four
// down-left diagonals (R2C5..R5C2, R3C6..R6C3, R4C7..R7C4, R5C8..R8C5), its
// columns the four down-right diagonals (R2C5..R5C8, R3C4..R6C7, R4C3..R7C6,
// R5C2..R8C5), and its two main diagonals are R2C5/R4C5/R6C5/R8C5 and
// R5C2/R5C4/R5C6/R5C8. No rules sentence is published with the puzzle, and the
// usual magic-square reading (one shared sum over all ten of those lines) is
// impossible here: square row 2 and square column 4 share R6C3, so equal sums
// force R5C2 + R8C5 = 12 + R4C5, i.e. at least 13, while the givens leave R8C5
// in {2,3,4} and R5C2 at most 8. With no sentence to name a weaker reading,
// the shading is left unencoded and the encoding below is under-constrained.

// Givens, read off the 17 filled cells of the drawn grid.
const givens = [
  ['R1C4', 6], ['R1C5', 9], ['R1C9', 2], ['R2C1', 4], ['R3C2', 9],
  ['R3C6', 8], ['R4C9', 5], ['R5C4', 9], ['R5C6', 5], ['R7C4', 5],
  ['R7C7', 4], ['R7C8', 7], ['R8C7', 8], ['R8C9', 6], ['R9C1', 6],
  ['R9C5', 1], ['R9C6', 7],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, digit]) => new Given(cell, digit)),
];
