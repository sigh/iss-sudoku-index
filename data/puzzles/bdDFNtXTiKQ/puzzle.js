// Title: The Secret Of The Three Worlds
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=bdDFNtXTiKQ
// Source: https://app.crackingthecryptic.com/sudoku/MJqpJrmrB6

// Normal sudoku rules apply (default row/column/box all-different, standard
// 3x3 boxes -- the payload's regions are the ordinary boxes). Fifteen arrows:
// digits along each arrow's arm sum to the digit in its circle. Two arrows
// may share one circle (a branch); Arrow(circle, ...arm) encodes each one
// separately since the two arms are independent sums to the same circle
// digit, not one combined constraint.
return [
  new Shape('9x9'),

  new Arrow('R2C3', 'R3C4', 'R3C5'),
  new Arrow('R2C6', 'R1C5', 'R1C4'),
  new Arrow('R2C6', 'R1C7', 'R1C8'),
  new Arrow('R2C7', 'R3C6'),
  new Arrow('R5C7', 'R4C6', 'R4C5'),
  new Arrow('R5C7', 'R6C6', 'R6C5'),
  new Arrow('R6C7', 'R7C6'),
  new Arrow('R5C4', 'R4C3', 'R4C2'),
  new Arrow('R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Arrow('R7C1', 'R6C2', 'R6C3'),
  new Arrow('R8C4', 'R8C5', 'R8C6'),
  new Arrow('R9C4', 'R9C5', 'R9C6'),
  new Arrow('R8C4', 'R9C3'),
  new Arrow('R9C4', 'R8C3'),
  new Arrow('R8C9', 'R7C9', 'R7C8'),
];
