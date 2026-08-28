// Title: A Good Knight Sudoku
// Author: Mike Halderman
// Video: https://www.youtube.com/watch?v=FfdHBAv25Fo
// Source: https://cracking-the-cryptic.web.app/sudoku/LP3bm2Gtmm

// Normal sudoku rules apply (rows, columns, 3x3 boxes). Digits a chess
// knight's move apart may not repeat (global, all cells) -- payload carries
// no rules text; this comes from the video description: "Identical digits
// cannot be separated by a knight's move."

// Givens: from the payload's cells array.
return [
  new Shape('9x9'),

  new Given('R1C1', 7),
  new Given('R1C4', 2),
  new Given('R2C7', 6),
  new Given('R4C2', 3),
  new Given('R4C8', 8),
  new Given('R6C1', 9),
  new Given('R6C2', 5),
  new Given('R6C8', 4),
  new Given('R6C9', 3),
  new Given('R7C1', 3),
  new Given('R7C8', 9),
  new Given('R7C9', 8),
  new Given('R8C3', 1),
  new Given('R8C7', 2),
  new Given('R9C1', 5),
  new Given('R9C4', 7),
  new Given('R9C6', 8),
  new Given('R9C9', 4),

  new AntiKnight(),
];
