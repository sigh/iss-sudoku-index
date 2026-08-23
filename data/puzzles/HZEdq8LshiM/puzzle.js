// Title: A Week Or Two
// Author: Joseph Nehme
// Video: https://www.youtube.com/watch?v=HZEdq8LshiM
// Source: https://app.crackingthecryptic.com/sudoku/R3rTGMB6BT

// Normal sudoku rules apply (default 9x9 rows/cols/boxes). Cage digits sum to
// the small clue printed in the cage's top-left cell (Cage's first argument
// is the sum). Arrow digits sum to the digit in the arrow's circle (Arrow's
// first cell is the bulb/circle cell, per its ISS semantics). The drawn white
// circle on each arrow's first cell is the bulb rendering, not a separate
// clue.

return [
  new Shape('9x9'),

  new Cage(14, 'R1C1', 'R1C2'),
  new Cage(14, 'R8C1', 'R9C1'),
  new Cage(14, 'R7C4', 'R7C5', 'R7C6'),
  new Cage(14, 'R8C9', 'R9C9'),

  new Arrow('R7C1', 'R7C2', 'R8C2'),
  new Arrow('R9C5', 'R8C4', 'R8C5'),
  new Arrow('R6C2', 'R5C3', 'R4C3', 'R3C3'),
  new Arrow('R5C4', 'R4C5', 'R4C6'),
  new Arrow('R5C6', 'R5C7', 'R4C7', 'R3C6', 'R3C5'),
  new Arrow('R2C8', 'R2C7', 'R3C7', 'R3C8'),
  new Arrow('R5C9', 'R6C9', 'R5C8'),
];
