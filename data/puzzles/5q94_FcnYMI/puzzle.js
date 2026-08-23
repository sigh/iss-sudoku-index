// Title: noXing
// Author: Qinlux
// Video: https://www.youtube.com/watch?v=5q94_FcnYMI
// Source: https://app.crackingthecryptic.com/sudoku/8HqNFgLQD4

// Rules: "Normal sudoku rules apply." The payload carries no cages, lines,
// arrows, or other markup beyond the givens and the 9 standard box regions,
// and the source rules text names no additional constraint. Plain classic
// sudoku: default row/column/box all-different, plus the 26 givens below.

return [
  new Shape('9x9'),

  new Given('R1C1', 6), new Given('R1C4', 5), new Given('R1C6', 4), new Given('R1C7', 3),
  new Given('R2C3', 9),
  new Given('R3C1', 1), new Given('R3C9', 5),
  new Given('R4C1', 8), new Given('R4C5', 5), new Given('R4C6', 3), new Given('R4C9', 6),
  new Given('R5C2', 6), new Given('R5C3', 5), new Given('R5C6', 7),
  new Given('R6C1', 4), new Given('R6C4', 9), new Given('R6C9', 7),
  new Given('R7C2', 1), new Given('R7C5', 4), new Given('R7C8', 9),
  new Given('R8C3', 2), new Given('R8C5', 8),
  new Given('R9C4', 3), new Given('R9C6', 5), new Given('R9C7', 2), new Given('R9C9', 4),
];
