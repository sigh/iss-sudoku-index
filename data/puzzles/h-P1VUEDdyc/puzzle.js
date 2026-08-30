// Title: Coloured Circles Sudoku
// Author: Andrew Taylor
// Video: https://www.youtube.com/watch?v=h-P1VUEDdyc
// Source: https://cracking-the-cryptic.web.app/sudoku/8jGtfQgjNG

// Normal Sudoku rules apply (rows, columns and boxes; the payload's 9
// regions are exactly the ordinary 3x3 boxes). The raw payload carries no
// rules text at all -- no metadata object and no rules field of any kind.
// The board also draws 60 of 81 cells with a coloured square underlay in
// one of six colours, arranged as concentric diamond rings, but no rules
// sentence gives colour a meaning, so it is decorative for encoding
// purposes and is not encoded.
const givens = [
  new Given('R3C2', 4),
  new Given('R5C5', 5),
  new Given('R5C6', 8),
  new Given('R6C5', 1),
  new Given('R6C6', 6),
  new Given('R8C2', 7),
];

return [
  new Shape('9x9'),
  ...givens,
];
