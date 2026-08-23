// Title: August 7, 2021: Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=i3JiNbn1t_Q
// Source: https://tinyurl.com/bzeymea3

// Normal sudoku rules apply. Digits along an arrow must sum to the value in
// the adjoining circle (bulb); arm digits may repeat, subject to the normal
// row/column/box constraints. `Arrow` takes the bulb cell first, then the
// arm cells in order away from the bulb.
// The bulb at R5C7 has two arms sharing the bulb (drawn as two strokes), so
// it is encoded as two Arrow constraints, both starting at R5C7.

return [
  new Shape('9x9'),

  new Arrow('R1C6', 'R2C5', 'R3C4', 'R4C3', 'R5C2', 'R6C1'),
  new Arrow('R3C3', 'R4C2', 'R5C1'),
  new Arrow('R5C3', 'R4C4', 'R3C5', 'R2C6'),
  new Arrow('R4C1', 'R3C2', 'R2C3', 'R1C4'),
  new Arrow('R7C2', 'R6C3', 'R5C4'),
  new Arrow('R9C4', 'R8C5', 'R7C6', 'R6C7', 'R5C8', 'R4C9'),
  new Arrow('R6C5', 'R5C6', 'R4C7'),
  new Arrow('R9C6', 'R8C7', 'R7C8', 'R6C9'),
  new Arrow('R5C7', 'R6C6', 'R7C5', 'R8C4'),
  new Arrow('R5C7', 'R4C8', 'R3C9'),
  new Arrow('R7C3', 'R6C4'),
  new Arrow('R4C6', 'R3C7'),
];
