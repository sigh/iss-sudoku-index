// Title: Foggy Loop
// Author: Antiknight
// Video: https://www.youtube.com/watch?v=hwUc0NGdnuM
// Source: https://app.crackingthecryptic.com/sudoku/rqFff63jpm

// Normal sudoku rules apply on the default 9x9 boxes. Each arrow's arm cells
// sum to the digit in its circle (circle listed first, then the arm). Each
// listed 9-cell cage has no total, only all-different. Each listed dot pairs
// adjacent cells: black is a 2:1 ratio, white is consecutive; the rules state
// dots are not exhaustively drawn, so no negative (StrictKropki) constraint
// is added for undotted edges. The source's `foglight` reveal metadata is
// solving UI, not a rule, and is not encoded.
// Arrows "don't branch/overlap" and "each circle has exactly one arrow" are
// already true of the fixed drawn geometry below and add no constraint.

return [
  new Shape('9x9'),
  new Given('R4C6', 9),

  // Cages: four 3x3 blocks offset by one row/col from the standard boxes.
  new AllDifferent('R2C2', 'R2C3', 'R2C4', 'R3C2', 'R3C3', 'R3C4', 'R4C2', 'R4C3', 'R4C4'),
  new AllDifferent('R2C6', 'R2C7', 'R2C8', 'R3C6', 'R3C7', 'R3C8', 'R4C6', 'R4C7', 'R4C8'),
  new AllDifferent('R6C2', 'R6C3', 'R6C4', 'R7C2', 'R7C3', 'R7C4', 'R8C2', 'R8C3', 'R8C4'),
  new AllDifferent('R6C6', 'R6C7', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R8C7', 'R8C8'),

  // Arrows: circle cell first, then the arm cells outward.
  new Arrow('R3C3', 'R3C2', 'R2C2', 'R2C3', 'R1C4'),
  new Arrow('R3C7', 'R2C7', 'R2C8', 'R3C8', 'R4C9'),
  new Arrow('R8C2', 'R8C3', 'R7C3', 'R7C2', 'R6C1'),
  new Arrow('R8C8', 'R7C8', 'R7C7', 'R8C7', 'R9C6'),
  new Arrow('R5C3', 'R5C4', 'R5C5', 'R5C6'),
  new Arrow('R2C9', 'R1C8', 'R1C7'),
  new Arrow('R3C4', 'R3C5', 'R3C6'),

  // Dots.
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R6C6', 'R6C7'),
  new BlackDot('R2C2', 'R3C2'),
];
