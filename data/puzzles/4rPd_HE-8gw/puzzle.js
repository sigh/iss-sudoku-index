// Title: r
// Author: PulverizingPancake
// Video: https://www.youtube.com/watch?v=4rPd_HE-8gw
// Source: https://app.crackingthecryptic.com/sudoku/qRNMQNjFF3

// Normal sudoku rules apply (default row/column/box all-different from
// Shape('9x9')). Payload regions are the standard nine 3x3 boxes, so no
// custom region constraint is needed.
// In cages, digits cannot repeat, and sum to the number in the cage's
// top-left cell. Cage(sum, ...cells) bakes in both the sum and the
// all-different requirement.

return [
  new Shape('9x9'),

  new Given('R9C9', 5),

  // Cage cell sets transcribed from the drawn cage geometry (13 cages).
  new Cage(6, 'R2C2', 'R2C3', 'R3C2'),
  new Cage(7, 'R3C3', 'R4C3', 'R3C4'),
  new Cage(8, 'R5C3', 'R6C3', 'R5C4'),
  new Cage(9, 'R6C1', 'R6C2', 'R7C1'),
  new Cage(10, 'R1C4', 'R2C4', 'R1C5'),
  new Cage(11, 'R8C1', 'R8C2', 'R9C1'),
  new Cage(12, 'R3C5', 'R3C6', 'R4C5'),
  new Cage(13, 'R4C6', 'R5C6', 'R4C7'),
  new Cage(14, 'R5C7', 'R6C7', 'R5C8'),
  new Cage(15, 'R6C8', 'R7C8', 'R6C9'),
  new Cage(16, 'R6C5', 'R7C5', 'R6C6'),
  new Cage(17, 'R7C3', 'R7C4', 'R8C3'),
  new Cage(18, 'R7C6', 'R7C7', 'R8C6'),
];
