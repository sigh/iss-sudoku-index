// Title: August 14, 2022: Nonconsec
// Author: clover!
// Video: https://www.youtube.com/watch?v=EWHoAiQgvYM
// Source: https://tinyurl.com/yckuxedn

// Normal sudoku rules apply. Digits in orthogonally adjacent cells (sharing
// an edge) may not be consecutive. AntiConsecutive applies this globally to
// every adjacent pair on the board, matching the rule text ("anywhere in
// the puzzle").

return [
  new Shape('9x9'),

  new Given('R2C4', 5),
  new Given('R2C5', 1),
  new Given('R2C6', 9),
  new Given('R3C1', 7),
  new Given('R3C3', 8),
  new Given('R3C7', 1),
  new Given('R3C9', 5),
  new Given('R4C5', 3),
  new Given('R5C2', 7),
  new Given('R5C4', 1),
  new Given('R5C6', 5),
  new Given('R5C8', 3),
  new Given('R6C5', 7),
  new Given('R7C1', 1),
  new Given('R7C3', 9),
  new Given('R7C7', 3),
  new Given('R7C9', 4),
  new Given('R8C4', 3),
  new Given('R8C5', 8),
  new Given('R8C6', 4),

  new AntiConsecutive(),
];
