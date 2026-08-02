// Title: Bidirectional 34
// Author: just kirb
// Video: https://www.youtube.com/watch?v=weQoFPxou2E
// Source: https://app.crackingthecryptic.com/8n6RPbqntg

// Rules encoded: normal sudoku; every arrow's circled digit equals the sum of
// its arm digits; and no digit repeats at the same relative position in two
// 3x3 boxes.

// Arrow paths transcribed from the seven drawn arrow entries; each list is the
// circled cell followed by its arm cells in the drawn path order.
const arrows = [
  new Arrow('R1C5', 'R1C6', 'R2C5', 'R3C4'),
  new Arrow('R4C8', 'R4C9', 'R5C8', 'R6C7'),
  new Arrow('R4C2', 'R4C3', 'R5C2', 'R6C1'),
  new Arrow('R7C5', 'R7C6', 'R8C5', 'R9C4'),
  new Arrow('R9C9', 'R8C8', 'R7C7'),
  new Arrow('R6C6', 'R5C5', 'R4C4'),
  new Arrow('R3C3', 'R2C2', 'R1C1'),
];

return [
  new Shape('9x9'),
  new Given('R5C1', 3),
  new Given('R6C8', 4),
  ...arrows,
  new DisjointSets(),
];
