// Title: Knight Sudoku
// Author: Jonas Gleim
// Video: https://www.youtube.com/watch?v=2-rUWU_aQjY
// Source: https://cracking-the-cryptic.web.app/sudoku/6nbfrqr4Ng

// Normal sudoku rules apply. In addition, cells a knight's move (in chess)
// apart cannot contain the same digit; AntiKnight enforces exactly that,
// globally, over every knight-move pair in the grid. Rules text transcribed
// from the video's on-screen rules panel.

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R2C4', 3),
  new Given('R2C6', 2),
  new Given('R3C3', 9),
  new Given('R3C7', 3),
  new Given('R4C2', 2),
  new Given('R4C8', 4),
  new Given('R5C1', 3),
  new Given('R5C9', 5),
  new Given('R6C2', 4),
  new Given('R6C8', 6),
  new Given('R7C3', 4),
  new Given('R7C7', 7),
  new Given('R8C4', 1),
  new Given('R8C6', 8),
  new Given('R9C5', 9),
  new AntiKnight(),
];
