// Title: 123...9
// Author: Henk Nicolai
// Video: https://www.youtube.com/watch?v=WrAlttadCZU
// Source: https://app.crackingthecryptic.com/sudoku/Btqp8DBmD7

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9'), standard 3x3 boxes, no givens).
//
// Arrows: digits along the arrow's arm sum to the digit in its circled bulb
// cell; digits may repeat along an arrow. Arrow(bulb, ...arm) matches this
// directly (first cell is the circle, remaining cells are summed to it).
//
// Outside diagonal sums: each outside clue gives the sum of the digits along
// a short diagonal running in from the grid edge next to it; digits may
// repeat along the diagonal, so each is a plain Sum (not a Cage) over its
// listed cells. Cell lists are transcribed from the payload's off-grid arrow
// waypoints (direction) paired with the nearest overlay text, cross-checked
// by hand against the drawn arrow geometry.

return [
  new Shape('9x9'),

  // Arrows -- bulb cell first, then arm cells, matched to the four drawn
  // circles at R3C4, R4C3, R7C6, R6C7.
  new Arrow('R3C4', 'R3C5', 'R2C6'),
  new Arrow('R4C3', 'R5C3', 'R6C2', 'R7C3'),
  new Arrow('R7C6', 'R7C5', 'R8C4'),
  new Arrow('R6C7', 'R5C7', 'R4C8', 'R3C7'),

  // Outside diagonal sums -- each printed total paired with the short
  // diagonal its off-grid arrow indicator points into.
  new Sum(21, 'R4C1', 'R5C2', 'R6C3', 'R7C4', 'R8C5', 'R9C6'),
  new Sum(15, 'R6C1', 'R7C2', 'R8C3', 'R9C4'),
  new Sum(31, 'R9C5', 'R8C6', 'R7C7', 'R6C8', 'R5C9'),
  new Sum(11, 'R4C9', 'R3C8', 'R2C7', 'R1C6'),
  new Sum(25, 'R6C9', 'R5C8', 'R4C7', 'R3C6', 'R2C5', 'R1C4'),
  new Sum(20, 'R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1'),
];
