// Title: QR Code
// Author: Ore
// Video: https://www.youtube.com/watch?v=E2ZJZ9jTBUI
// Source: https://tinyurl.com/5hd9tf6r
//
// Rules encoded: standard row/column/region all-different, killer cages
// (sum + all-different within the cage), and both long diagonals
// all-different. The 9 regions are irregular, not the default 3x3 boxes, so
// the default boxes are dropped (NoBoxes) and replaced with 9 explicit
// Jigsaw pieces below. Region membership and cage cell lists are transcribed
// from the payload's per-cell `region` overrides and its `killercage` array
// (default box used wherever no override is present); together they trace
// the QR-code finder-pattern look the title refers to, which is otherwise
// cosmetic.

return [
  new NoBoxes(),

  new Jigsaw('9x9',
    'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R2C3', 'R3C2', 'R3C3', 'R3C4', 'R4C3'),
  new Jigsaw('9x9',
    'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C4', 'R2C5', 'R2C6', 'R3C5'),
  new Jigsaw('9x9',
    'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C6', 'R3C7', 'R3C8', 'R4C7'),
  new Jigsaw('9x9',
    'R3C1', 'R4C1', 'R4C2', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R6C2', 'R7C1'),
  new Jigsaw('9x9',
    'R4C4', 'R4C5', 'R4C6', 'R5C4', 'R5C5', 'R5C6', 'R6C4', 'R6C5', 'R6C6'),
  new Jigsaw('9x9',
    'R3C9', 'R4C8', 'R4C9', 'R5C7', 'R5C8', 'R5C9', 'R6C8', 'R6C9', 'R7C9'),
  new Jigsaw('9x9',
    'R6C3', 'R7C2', 'R7C3', 'R7C4', 'R8C1', 'R8C2', 'R8C3', 'R9C1', 'R9C2'),
  new Jigsaw('9x9',
    'R7C5', 'R8C4', 'R8C5', 'R8C6', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7'),
  new Jigsaw('9x9',
    'R6C7', 'R7C6', 'R7C7', 'R7C8', 'R8C7', 'R8C8', 'R8C9', 'R9C8', 'R9C9'),

  new Diagonal(1),
  new Diagonal(-1),

  // Cage cells and totals transcribed from the payload's `killercage` array.
  new Cage(12, 'R4C9', 'R5C9', 'R6C9'),
  new Cage(13, 'R8C1', 'R9C1'),
  new Cage(13, 'R8C2', 'R9C2'),
  new Cage(25, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(14, 'R1C8', 'R1C9'),
  new Cage(12, 'R2C8', 'R2C9'),
  new Cage(9, 'R5C4', 'R6C4', 'R6C5'),
  new Cage(17, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(11, 'R7C7', 'R8C7'),
  new Cage(11, 'R7C8', 'R8C8'),
];
