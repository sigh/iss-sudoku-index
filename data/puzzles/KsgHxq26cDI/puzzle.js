// Title: The Devil's Arrows
// Author: Lisztes
// Video: https://www.youtube.com/watch?v=KsgHxq26cDI
// Source: https://app.crackingthecryptic.com/sudoku/ftF76fpqdQ

// Rules: normal sudoku. Cages sum to the total in the cage's top-left cell,
// digits do not repeat within a cage. Arrow digits sum to the digit in that
// arrow's circle. Grey squares are even; grey circles are odd. No givens.
// Grid regions are the ordinary nine 3x3 boxes.

return [
  new Shape('9x9'),

  // Cages (killer cage = distinct + sum to total).
  // The two 9-cell cages are 3x3 blocks offset from the box grid lines, so
  // their real force is "all 9 digits, no repeats" -- Cage's sum check is
  // trivially satisfied (any 9 distinct 1-9 digits sum to 45).
  new Cage(45, 'R2C2', 'R3C2', 'R4C2', 'R4C3', 'R3C3', 'R2C3', 'R2C4', 'R3C4', 'R4C4'),
  new Cage(45, 'R6C8', 'R7C8', 'R8C8', 'R6C7', 'R7C7', 'R8C7', 'R6C6', 'R7C6', 'R8C6'),
  new Cage(10, 'R2C8', 'R3C8'),
  new Cage(6, 'R8C1', 'R8C2'),
  new Cage(14, 'R1C1', 'R2C1'),
  new Cage(11, 'R4C6', 'R5C6'),

  // Arrows (bulb cell first, then arm cells).
  // The two arrows into R5C9 are drawn as two separate arrow strokes whose
  // start points both land inside cell R5C9 at slightly different offsets,
  // while only one circle is drawn there -- one shared bulb, two arms, each
  // arm summing separately to that cell's digit.
  new Arrow('R1C2', 'R1C3', 'R1C4', 'R2C5'),
  new Arrow('R5C9', 'R5C8', 'R5C7', 'R5C6'),
  new Arrow('R5C9', 'R6C9', 'R7C9', 'R8C9'),
  new Arrow('R9C9', 'R9C8', 'R9C7', 'R9C6'),
  new Arrow('R9C1', 'R8C1', 'R7C1', 'R6C1'),

  // Odd/even cells (grey-filled underlays), encoded as a candidate
  // restriction. Arrow bulbs are separate white-filled circles, not these
  // grey-filled marks, so they are not included here.
  new Given('R3C1', 2, 4, 6, 8),
  new Given('R3C5', 2, 4, 6, 8),
  new Given('R4C5', 2, 4, 6, 8),
  new Given('R1C5', 1, 3, 5, 7, 9),
  new Given('R1C7', 1, 3, 5, 7, 9),
  new Given('R2C7', 1, 3, 5, 7, 9),
  new Given('R4C1', 1, 3, 5, 7, 9),
  new Given('R6C3', 1, 3, 5, 7, 9),
  new Given('R7C5', 1, 3, 5, 7, 9),
];
