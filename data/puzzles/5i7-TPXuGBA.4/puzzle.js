// Title: 11/15: A Straight and Arrows
// Author: Unknown
// Video: https://www.youtube.com/watch?v=5i7-TPXuGBA
// Source: https://tinyurl.com/mt2pptnv

// Normal sudoku rules apply. Digits along an arrow sum to the digit in that
// arrow's circled cell; digits may repeat along an arrow. No other rule is
// stated or drawn.
//
// Each arrow below is [circle cell, ...shaft cells], read from the payload's
// `arrow[].lines` paths (circle first, then the drawn shaft).

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C2', 2),
  new Given('R2C4', 3),
  new Given('R3C3', 3),
  new Given('R3C9', 1),
  new Given('R4C4', 4),
  new Given('R5C5', 5),
  new Given('R6C6', 6),
  new Given('R7C1', 9),
  new Given('R7C7', 7),
  new Given('R8C6', 7),
  new Given('R8C8', 8),
  new Given('R9C9', 9),

  new Arrow('R3C4', 'R2C3', 'R1C2'),
  new Arrow('R4C6', 'R3C5', 'R2C4'),
  new Arrow('R7C9', 'R6C8', 'R5C7'),
  new Arrow('R6C7', 'R5C6', 'R4C5'),
  new Arrow('R6C4', 'R7C5', 'R8C6'),
  new Arrow('R4C3', 'R5C4', 'R6C5'),
  new Arrow('R3C1', 'R4C2', 'R5C3'),
  new Arrow('R7C6', 'R8C7', 'R9C8'),
  new Arrow('R9C1', 'R8C2', 'R7C3'),
  new Arrow('R1C9', 'R2C8', 'R3C7'),
];
