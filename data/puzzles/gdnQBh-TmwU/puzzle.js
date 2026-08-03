// Title: Arrow or Centipede?
// Author: Eric Rathbun
// Video: https://www.youtube.com/watch?v=gdnQBh-TmwU
// Source: https://app.crackingthecryptic.com/sudoku/8Pp22D4f98
//
// Normal sudoku rules apply. Twelve arrows all share the same circle, R5C5:
// digits along each arrow sum to R5C5's digit. Cage digits are non-repeating
// and sum to the cage total. White dots mark adjacent cells differing by one;
// black dots mark adjacent cells in a 1:2 ratio. No negative-Kropki clause is
// stated, so only the drawn dots are constrained.

return [
  new Shape('9x9'),

  // Cages: cells from `cages[].cells`, totals from `cages[].value`.
  new Cage(18, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(12, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(10, 'R8C1', 'R8C2', 'R9C2'),
  new Cage(21, 'R8C9', 'R9C8', 'R9C9'),

  // Twelve arrows, all bulbed on the single circle at R5C5. Arrow() takes the
  // circle cell first, then the arm cells nearest-to-farthest; repeats are
  // allowed along an arm.
  new Arrow('R5C5', 'R4C4', 'R3C4'),
  new Arrow('R5C5', 'R4C5', 'R3C5'),
  new Arrow('R5C5', 'R4C6', 'R3C6'),
  new Arrow('R5C5', 'R5C6', 'R4C7', 'R3C7'),
  new Arrow('R5C5', 'R5C6', 'R5C7'),
  new Arrow('R5C5', 'R5C6', 'R6C7', 'R7C7'),
  new Arrow('R5C5', 'R6C6', 'R7C6'),
  new Arrow('R5C5', 'R6C5', 'R7C5'),
  new Arrow('R5C5', 'R6C4', 'R7C4'),
  new Arrow('R5C5', 'R5C4', 'R5C3'),
  new Arrow('R5C5', 'R5C4', 'R4C3', 'R3C3'),
  new Arrow('R5C5', 'R5C4', 'R6C3', 'R7C3'),

  // White dots: adjacent cells differ by one.
  new WhiteDot('R2C6', 'R3C6'),
  new WhiteDot('R3C6', 'R3C7'),
  new WhiteDot('R4C1', 'R5C1'),
  new WhiteDot('R9C3', 'R9C4'),

  // Black dots: adjacent cells are in a 1:2 ratio.
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R2C4', 'R2C5'),
];
