// Title: Sudoku Meets Tetris
// Author: Unknown
// Video: https://www.youtube.com/watch?v=qqhwBX1VozQ
// Source: https://cracking-the-cryptic.web.app/sudoku/FL2ND6b6MF

// Normal Sudoku rules apply (rows, columns and boxes; the payload's 9
// regions are exactly the ordinary 3x3 boxes). The raw payload carries no
// rules text at all -- no metadata object and no rules field of any kind.
// The board also draws 28 cells of uniform light-grey underlay shading
// arranged as 7 disjoint tetromino shapes (matching the video title
// "Sudoku Meets Tetris"), but every shaded cell uses the identical
// fill/border colour with no per-cell distinguishing mark, so no rule can
// be read from the shading either. It is decorative for encoding purposes
// and is not encoded.
const givens = [
  new Given('R1C1', 7),
  new Given('R1C5', 8),
  new Given('R1C9', 9),
  new Given('R3C3', 6),
  new Given('R3C7', 7),
  new Given('R5C1', 2),
  new Given('R5C5', 4),
  new Given('R5C9', 5),
  new Given('R7C3', 2),
  new Given('R7C7', 3),
  new Given('R9C1', 8),
  new Given('R9C5', 6),
  new Given('R9C9', 7),
];

return [
  new Shape('9x9'),
  ...givens,
];
