// Title: Anti-Knight Circles
// Author: Frans Wentholt; Jurre Klinkenberg
// Video: https://www.youtube.com/watch?v=Af9T4lWwAlc
// Source: https://app.crackingthecryptic.com/webapp/RGh4Rq7QPH

// Normal sudoku rules apply. Cells a chess knight's move apart cannot hold
// the same digit (AntiKnight). The payload carries no cages, lines, arrows,
// or other overlays beyond the givens and the standard 3x3 boxes.

return [
  new Shape('9x9'),

  new AntiKnight(),

  // Givens, transcribed from the puzzle's drawn grid.
  new Given('R2C3', 2),
  new Given('R2C4', 3),
  new Given('R3C2', 1),
  new Given('R3C5', 4),
  new Given('R4C2', 8),
  new Given('R4C5', 5),
  new Given('R5C3', 7),
  new Given('R5C4', 6),
  new Given('R6C7', 8),
  new Given('R6C8', 7),
  new Given('R7C6', 9),
  new Given('R7C9', 6),
  new Given('R8C6', 2),
  new Given('R8C9', 5),
  new Given('R9C7', 3),
  new Given('R9C8', 4),
];
