// Title: Jul 13, 2022: Clone / Arrow
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=N5-MQ7TWs3s
// Source: https://tinyurl.com/2p96tjrz

// Normal sudoku (standard 3x3 boxes). Each arrow's circle cell equals the sum
// of the rest of its path. The five grey 1x3 strips are all clones of each
// other: same digits in the same relative position.
//
// Clone correspondence: all five strips are horizontal 1x3 runs drawn in the
// same left-to-right orientation (no rotation or reflection between any
// pair), so "same relative position" is matched cell-by-cell in that shared
// reading order. Encoded as one SameValues(2, a, b) per matched cell pair --
// a plain positional equality between two cells -- for each of the payload's
// five clone edges (a 5-cycle: strip0->strip1->strip2->strip3->strip4->strip0).

return [
  new Shape('9x9'),

  new Given('R1C4', 4),
  new Given('R2C1', 5),
  new Given('R2C5', 3),
  new Given('R2C7', 2),
  new Given('R2C8', 6),
  new Given('R4C8', 4),
  new Given('R5C1', 4),
  new Given('R5C9', 1),
  new Given('R6C2', 3),
  new Given('R8C2', 4),
  new Given('R8C3', 5),
  new Given('R8C5', 2),
  new Given('R8C9', 3),
  new Given('R9C6', 6),

  // Arrows: first cell is the circle, sum of the rest equals it.
  new Arrow('R2C2', 'R3C2', 'R4C2'),
  new Arrow('R5C4', 'R5C3', 'R5C2'),
  new Arrow('R8C6', 'R7C6', 'R6C6'),
  new Arrow('R5C6', 'R5C7', 'R5C8'),
  new Arrow('R8C8', 'R7C8', 'R6C8'),
  new Arrow('R2C4', 'R3C4', 'R4C4'),
  new Arrow('R7C1', 'R8C1', 'R9C1'),
  new Arrow('R3C9', 'R2C9', 'R1C9'),
  new Arrow('R7C3', 'R7C4', 'R7C5'),
  new Arrow('R3C7', 'R3C6', 'R3C5'),

  // Clone edge: strip0 (R2C2,R2C3,R2C4) <-> strip1 (R5C4,R5C5,R5C6).
  new SameValues(2, 'R2C2', 'R5C4'),
  new SameValues(2, 'R2C3', 'R5C5'),
  new SameValues(2, 'R2C4', 'R5C6'),

  // Clone edge: strip1 (R5C4,R5C5,R5C6) <-> strip2 (R8C6,R8C7,R8C8).
  new SameValues(2, 'R5C4', 'R8C6'),
  new SameValues(2, 'R5C5', 'R8C7'),
  new SameValues(2, 'R5C6', 'R8C8'),

  // Clone edge: strip2 (R8C6,R8C7,R8C8) <-> strip3 (R3C7,R3C8,R3C9).
  new SameValues(2, 'R8C6', 'R3C7'),
  new SameValues(2, 'R8C7', 'R3C8'),
  new SameValues(2, 'R8C8', 'R3C9'),

  // Clone edge: strip3 (R3C7,R3C8,R3C9) <-> strip4 (R7C1,R7C2,R7C3).
  new SameValues(2, 'R3C7', 'R7C1'),
  new SameValues(2, 'R3C8', 'R7C2'),
  new SameValues(2, 'R3C9', 'R7C3'),

  // Clone edge: strip4 (R7C1,R7C2,R7C3) <-> strip0 (R2C2,R2C3,R2C4).
  new SameValues(2, 'R7C1', 'R2C2'),
  new SameValues(2, 'R7C2', 'R2C3'),
  new SameValues(2, 'R7C3', 'R2C4'),
];
