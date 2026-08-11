// Title: Ego
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=SD7p63H_NpA
// Source: https://tinyurl.com/2davrb6d

// Normal sudoku rules apply (default row/column/box all-different).
//
// "Digits in grey squares must be even." There is no native Odd/Even class,
// so each grey cell is a candidate-restriction Given to {2,4,6,8}. Cell list
// transcribed from the source's list of grey-shaded cells (32 cells).

const evenCells = [
  'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R2C3', 'R2C4', 'R2C7', 'R2C8',
  'R3C1', 'R3C2', 'R3C3', 'R3C8', 'R4C1', 'R4C8', 'R4C9', 'R5C1',
  'R5C9', 'R6C1', 'R6C2', 'R6C9', 'R7C2', 'R7C7', 'R7C8', 'R7C9',
  'R8C2', 'R8C3', 'R8C6', 'R8C7', 'R9C3', 'R9C4', 'R9C5', 'R9C6',
];

return [
  new Shape('9x9'),

  new Given('R1C1', 1),
  new Given('R2C4', 2),
  new Given('R2C5', 3),
  new Given('R3C2', 2),
  new Given('R4C3', 3),
  new Given('R4C4', 4),
  new Given('R5C4', 5),
  new Given('R5C6', 6),
  new Given('R6C6', 7),
  new Given('R6C7', 5),
  new Given('R7C8', 6),
  new Given('R8C5', 7),
  new Given('R8C6', 8),
  new Given('R9C9', 9),

  ...evenCells.map(cell => new Given(cell, 2, 4, 6, 8)),
];
