// Title: Easy Arrows
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=OpLO1MsmKU8
// Source: https://app.crackingthecryptic.com/sudoku/7g3F33FjQg
//
// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circle; two of the four arrows share one circle at R5C5. White dots
// mark adjacent cells holding consecutive digits; not all dots are drawn, so
// only the drawn pairs are constrained. No two cells a knight's move apart
// may hold the same digit.

return [
  new Shape('9x9'),

  // Arrows: circle cell first, then arm cells nearest-to-farthest. Cells and
  // circle/arm assignment from `arrows[].wayPoints`, matched to the circle
  // overlay at each arrow's first waypoint cell.
  new Arrow('R9C7', 'R8C6', 'R7C6', 'R6C7', 'R5C8', 'R4C9'),
  new Arrow('R1C3', 'R2C4', 'R3C4', 'R4C3', 'R5C2', 'R6C1'),
  new Arrow('R5C5', 'R4C6', 'R3C7'),
  new Arrow('R5C5', 'R6C4', 'R7C3'),

  // White dots: adjacent cells hold consecutive digits. Cells from the
  // edge-centred `overlays` marks.
  new WhiteDot('R1C9', 'R2C9'),
  new WhiteDot('R5C9', 'R6C9'),
  new WhiteDot('R9C2', 'R9C3'),
  new WhiteDot('R1C2', 'R2C2'),

  new AntiKnight(),
];
