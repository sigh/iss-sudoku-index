// Title: Burrows
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=HHBhhtKLJVY
// Source: https://app.crackingthecryptic.com/sudoku/4JnMFpQJ3n

// Normal sudoku rules apply (default row/column/box constraints; regions in
// the payload match the default 3x3 boxes exactly).
// Cages: digits sum to the clue in the cage's top-left cell and cannot
// repeat within the cage -- Cage(sum, ...cells) enforces both.
// Arrows: digits along the arrow sum to the digit in its circle -- Arrow's
// first argument is the bulb cell, the rest are the path cells.

return [
  new Shape('9x9'),

  new Given('R7C1', 4),

  new Cage(22, 'R4C1', 'R5C1', 'R6C1', 'R6C2', 'R6C3'),
  new Cage(23, 'R1C1', 'R1C2', 'R1C3', 'R2C1', 'R3C1'),
  new Cage(22, 'R2C2', 'R3C2', 'R3C3', 'R3C4', 'R3C5'),
  new Cage(23, 'R4C2', 'R4C3', 'R4C4', 'R4C5', 'R5C2'),
  new Cage(23, 'R4C7', 'R4C8', 'R4C9', 'R5C9', 'R6C9'),
  new Cage(22, 'R7C9', 'R8C9', 'R9C7', 'R9C8', 'R9C9'),
  new Cage(22, 'R5C8', 'R6C5', 'R6C6', 'R6C7', 'R6C8'),
  new Cage(23, 'R7C5', 'R7C6', 'R7C7', 'R7C8', 'R8C8'),

  new Arrow('R2C6', 'R3C6', 'R4C6'),
  new Arrow('R5C7', 'R5C6', 'R5C5'),
  new Arrow('R9C5', 'R9C6', 'R8C7'),
  new Arrow('R5C3', 'R6C4', 'R6C5'),
  new Arrow('R2C3', 'R1C4', 'R1C5'),
];
