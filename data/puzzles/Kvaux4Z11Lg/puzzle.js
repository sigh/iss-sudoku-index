// Title: A Sudoku With Worms!
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Kvaux4Z11Lg
// Source: https://cracking-the-cryptic.web.app/sudoku/qTGQdQ76hL
//
// Normal sudoku rules apply (standard 3x3 boxes -- the payload's own regions
// are exactly the nine boxes, so no Jigsaw/NoBoxes is needed).
//
// No rules text is present anywhere in the archived payload. Two unlabeled
// diagonal lines and six unlabeled shaded "worm" regions are drawn but
// nothing in the payload states what they require, so their rule is
// omitted here.

return [
  new Shape('9x9'),
  new Given('R6C2', 9),
  new Given('R6C6', 4),
  new Given('R7C1', 1),
  new Given('R7C5', 4),
  new Given('R9C3', 8),
];
