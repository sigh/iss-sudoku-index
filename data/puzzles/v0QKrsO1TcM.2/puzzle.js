// Title: Magic Square Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=v0QKrsO1TcM
// Source: https://cracking-the-cryptic.web.app/sudoku/2HdB6N7D8D

// Normal Sudoku rules apply. Three of the given 3x3 blocks form a magic
// square: the sum of both diagonals, the three rows and the three columns
// of that block is the same.
//
// The source payload has no colour/highlight data marking which three
// blocks, but the given placement does: boxes 1, 5 and 9 (the main-diagonal
// blocks, top-left/centre/bottom-right) are the only ones with zero givens,
// while the other six each carry exactly 3 -- the setter left just those
// three blocks to be pinned down by the magic-square rule itself. Those
// three are encoded as the magic squares.
//
// EqualSum ties a block's 3 rows, 3 columns and 2 diagonals to one common
// sum; the block's own all-different (from the box group) then forces that
// sum to 15.
const magicSquares = [
  ['R1C1', 'R1C2', 'R1C3', 'R2C1', 'R2C2', 'R2C3', 'R3C1', 'R3C2', 'R3C3'],
  ['R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'],
  ['R7C7', 'R7C8', 'R7C9', 'R8C7', 'R8C8', 'R8C9', 'R9C7', 'R9C8', 'R9C9'],
].map(([a, b, c, d, e, f, g, h, i]) => new EqualSum(
  [a, b, c], [d, e, f], [g, h, i],
  [a, d, g], [b, e, h], [c, f, i],
  [a, e, i], [c, e, g],
));

// Givens (source `cells`).
const givens = [
  new Given('R1C4', 8), new Given('R1C7', 1),
  new Given('R2C5', 9), new Given('R2C8', 2),
  new Given('R3C6', 7), new Given('R3C9', 3),
  new Given('R4C1', 1), new Given('R4C7', 2),
  new Given('R5C2', 6), new Given('R5C8', 3),
  new Given('R6C3', 9), new Given('R6C9', 1),
  new Given('R7C1', 3), new Given('R7C4', 7),
  new Given('R8C2', 4), new Given('R8C5', 8),
  new Given('R9C3', 7), new Given('R9C6', 9),
];

return [
  new Shape('9x9'),
  ...givens,
  ...magicSquares,
];
