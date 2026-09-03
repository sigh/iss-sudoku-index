// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=tHXXCW15bsk
// Source: https://cracking-the-cryptic.web.app/sudoku/9TDrQ7MTFQ

// Normal Sudoku rules apply. Anti-knight: cells a chess knight's move apart
// must not contain the same digit.
//
// The source payload carries no rules text and draws no lines, cages, arrows
// or overlays -- only 20 givens and the standard nine 3x3 boxes. The ruleset
// comes from the video title carried inside the payload itself, "US Sudoku
// Championship 2019 - Anti Knight Sudoku", which names a published genre with
// a fixed ruleset: normal Sudoku plus the anti-knight negative constraint.

return [
  new Shape('9x9'),

  // Givens, from the payload's cell values.
  new Given('R1C1', 6),
  new Given('R1C8', 8),
  new Given('R1C9', 9),
  new Given('R3C3', 1),
  new Given('R3C4', 2),
  new Given('R3C5', 3),
  new Given('R4C3', 4),
  new Given('R4C4', 5),
  new Given('R4C5', 6),
  new Given('R5C3', 7),
  new Given('R5C4', 8),
  new Given('R5C5', 9),
  new Given('R6C7', 4),
  new Given('R7C6', 2),
  new Given('R8C1', 3),
  new Given('R8C8', 1),
  new Given('R8C9', 2),
  new Given('R9C1', 7),
  new Given('R9C8', 4),
  new Given('R9C9', 5),

  new AntiKnight(),
];
