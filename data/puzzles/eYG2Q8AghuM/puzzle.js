// Title: XV Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=eYG2Q8AghuM
// Source: https://sudokupad.app/8f71xo5gv5
//
// Rules: normal sudoku. An X between two adjacent cells means they sum to 10;
// a V means they sum to 5. All Xs and Vs are given, so every unmarked
// adjacent pair is constrained to sum to neither 10 nor 5 (StrictXV).
// X/V edge list transcribed from the drawn "X"/"V" text overlays.

return [
  new Shape('9x9'),

  new Given('R2C1', 7), new Given('R2C9', 3),
  new Given('R3C2', 3), new Given('R3C8', 2),
  new Given('R4C3', 2), new Given('R4C7', 6),
  new Given('R5C4', 6), new Given('R5C6', 4),
  new Given('R6C5', 9),
  new Given('R8C1', 6), new Given('R8C9', 2),
  new Given('R9C2', 7), new Given('R9C8', 1),

  new StrictXV(),

  new X('R2C3', 'R2C4'),
  new X('R3C4', 'R4C4'),
  new X('R3C6', 'R4C6'),
  new X('R2C6', 'R2C7'),
  new X('R4C5', 'R5C5'),

  new V('R6C3', 'R7C3'),
  new V('R8C5', 'R9C5'),
  new V('R6C7', 'R7C7'),
];
