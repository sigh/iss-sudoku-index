// Title: Rigel
// Author: emmettcito
// Video: https://www.youtube.com/watch?v=i-ruvLjmdKk
// Source: https://app.crackingthecryptic.com/sudoku/rRmm2D6LfN

// Normal sudoku rules apply (default row/column/box all-different, no
// givens). Digits along an arrow must sum to the digit in that arrow's
// circle. Arrow(circleCell, ...armCells) states this directly per arrow.
//
// Several circle cells anchor more than one arrow (R3C7, R3C5, R5C7, R5C3,
// R7C5, R7C7): the payload draws one circle underlay at each such cell,
// shared by every arrow rooted there, so each arrow is still its own
// independent Arrow constraint over that shared circle cell.
return [
  new Shape('9x9'),

  new Arrow('R1C8', 'R1C9', 'R2C9'),
  new Arrow('R3C7', 'R3C8', 'R3C9'),
  new Arrow('R3C7', 'R2C6'),
  new Arrow('R3C5', 'R2C5', 'R1C5'),
  new Arrow('R3C5', 'R4C6'),
  new Arrow('R5C7', 'R4C6'),
  new Arrow('R4C4', 'R3C3', 'R2C2'),
  new Arrow('R4C1', 'R3C1', 'R2C1'),
  new Arrow('R6C1', 'R7C1', 'R8C1'),
  new Arrow('R5C3', 'R5C2', 'R5C1'),
  new Arrow('R5C3', 'R6C4'),
  new Arrow('R7C3', 'R8C3', 'R9C3'),
  new Arrow('R7C5', 'R8C5', 'R9C5'),
  new Arrow('R7C5', 'R6C6'),
  new Arrow('R5C7', 'R5C8', 'R5C9'),
  new Arrow('R7C6', 'R8C7', 'R9C8'),
  new Arrow('R7C7', 'R7C8', 'R7C9'),
  new Arrow('R7C7', 'R6C8'),
  new Arrow('R7C7', 'R8C6'),
];
