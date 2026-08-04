// Title: The Vow of Three Worlds
// Author: Playmaker6174
// Video: https://www.youtube.com/watch?v=PvDpp6w35_Q
// Source: https://app.crackingthecryptic.com/sudoku/bF6tMpT2mQ

// Normal Sudoku rules (default row/column/box all-different, standard boxes
// as drawn in `regions`). Digits along each arrow sum to the digit in that
// arrow's circle cell (Arrow's first argument is the circle, the rest is the
// shaft). Two circles (R6C1, R6C7) each anchor two arrows; both arrows from
// such a circle must independently sum to that one circle digit.
// Arrow cell lists transcribed from the drawn arrow paths, snapped to
// nearest cell centres.

return [
  new Shape('9x9'),

  new Arrow('R1C3', 'R2C4', 'R3C4'),
  new Arrow('R1C4', 'R2C5', 'R3C5'),
  new Arrow('R1C5', 'R2C6', 'R3C6'),
  new Arrow('R1C6', 'R1C7', 'R1C8', 'R1C9'),
  new Arrow('R2C1', 'R2C2', 'R2C3'),
  new Arrow('R3C1', 'R3C2', 'R3C3'),
  new Arrow('R6C1', 'R5C1', 'R4C1'),
  new Arrow('R6C1', 'R5C2', 'R4C3'),
  new Arrow('R6C4', 'R5C3', 'R4C2'),
  new Arrow('R6C7', 'R5C8', 'R4C9'),
  new Arrow('R6C7', 'R5C6', 'R4C5'),
  new Arrow('R7C9', 'R8C9', 'R9C9'),
  new Arrow('R8C4', 'R9C3'),
  new Arrow('R8C7', 'R7C6'),
  new Arrow('R9C4', 'R8C3', 'R7C2'),
  new Arrow('R9C7', 'R8C6', 'R7C5'),
  new Arrow('R4C8', 'R3C9'),
];
