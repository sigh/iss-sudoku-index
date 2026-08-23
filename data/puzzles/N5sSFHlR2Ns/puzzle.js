// Title: WYSI
// Author: brandon bot
// Video: https://www.youtube.com/watch?v=N5sSFHlR2Ns
// Source: https://app.crackingthecryptic.com/sudoku/Qr3Jq7rnLP

// Normal sudoku rules apply (default 9x9 Shape gives rows/cols/boxes, since
// the payload's regions array is the standard 3x3 box layout). Each cage's
// digits sum to the printed total and cannot repeat (Cage enforces both).
// The marked blue diagonal (R1C1..R9C9, the main diagonal) has no repeats.

return [
  new Shape('9x9'),

  new Cage(7, 'R1C2', 'R2C2'),
  new Cage(7, 'R4C1', 'R5C1'),
  new Cage(7, 'R6C1', 'R7C1'),
  new Cage(27, 'R7C3', 'R8C3', 'R9C3', 'R8C2'),
  new Cage(27, 'R1C3', 'R2C3', 'R1C4', 'R2C4'),
  new Cage(7, 'R3C3', 'R4C3'),
  new Cage(27, 'R3C6', 'R4C6', 'R4C5', 'R4C7'),
  new Cage(27, 'R1C7', 'R2C7', 'R2C8', 'R1C8', 'R1C9'),
  new Cage(27, 'R5C8', 'R6C8', 'R6C9', 'R5C9', 'R7C8', 'R7C9'),
  new Cage(27, 'R7C7', 'R8C9', 'R8C8', 'R8C7'),
  new Cage(7, 'R6C4', 'R7C4', 'R7C5'),

  // direction -1 is the '\' (main) diagonal, R1C1 to R9C9 -- matches the
  // drawn blue line's waypoints [0,0]-[9,9] (0-indexed payload coords).
  new Diagonal(-1),
];
