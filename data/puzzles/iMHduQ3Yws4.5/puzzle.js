// Title: June 12, 2023: Fried Liver
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=iMHduQ3Yws4
// Source: https://tinyurl.com/25h3xuab
//
// Normal sudoku, plus AntiKing (no repeated digit a king's move apart) and
// AntiKnight (no repeated digit a knight's move apart). Givens: R3 and R6 are
// fully filled, as drawn.

return [
  new Shape('9x9'),

  new AntiKing(),
  new AntiKnight(),

  new Given('R3C1', 1), new Given('R3C2', 2), new Given('R3C3', 3),
  new Given('R3C4', 4), new Given('R3C5', 5), new Given('R3C6', 6),
  new Given('R3C7', 7), new Given('R3C8', 8), new Given('R3C9', 9),

  new Given('R6C1', 9), new Given('R6C2', 1), new Given('R6C3', 2),
  new Given('R6C4', 3), new Given('R6C5', 4), new Given('R6C6', 5),
  new Given('R6C7', 6), new Given('R6C8', 7), new Given('R6C9', 8),
];
