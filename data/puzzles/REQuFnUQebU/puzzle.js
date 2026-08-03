// Title: Hiding Spots
// Author: Xendari
// Video: https://www.youtube.com/watch?v=REQuFnUQebU
// Source: https://app.crackingthecryptic.com/sudoku/88RG83pNt7

// Normal sudoku rules apply (default row/column/box all-different from Shape).
// Digits along an arrow must sum to the digit in that arrow's circle.
//
// The payload draws 18 separate arrow polylines sharing only 10 distinct
// circle cells, so several circles carry more than one independent arm; each
// arm below is its own Arrow (one shared circle cell, its own arm cells).

return [
  new Shape('9x9'),

  new Arrow('R6C4', 'R7C5'),
  new Arrow('R6C4', 'R5C3'),
  new Arrow('R6C4', 'R6C3', 'R6C2'),
  new Arrow('R6C4', 'R7C4', 'R8C4'),

  new Arrow('R3C6', 'R4C5'),
  new Arrow('R3C6', 'R2C6', 'R1C6'),

  new Arrow('R7C3', 'R7C2', 'R6C1'),
  new Arrow('R7C3', 'R8C3', 'R9C4'),

  new Arrow('R9C1', 'R8C1', 'R7C1'),
  new Arrow('R9C1', 'R9C2', 'R9C3'),

  new Arrow('R4C7', 'R5C6'),
  new Arrow('R4C7', 'R4C8', 'R4C9'),

  new Arrow('R7C6', 'R8C6', 'R8C7', 'R9C7'),

  new Arrow('R4C3', 'R4C2', 'R3C2', 'R3C1'),

  new Arrow('R6C9', 'R7C9', 'R8C9'),

  new Arrow('R1C4', 'R1C3', 'R1C2'),

  new Arrow('R2C8', 'R2C9', 'R3C9'),
  new Arrow('R2C8', 'R1C8', 'R2C7'),
];
