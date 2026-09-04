// Title: Non-consecutive Anti-Knight
// Author: Rishi Puri
// Video: https://www.youtube.com/watch?v=QNzltTzv0fc
// Source: https://cracking-the-cryptic.web.app/sudoku/qN6bJ3ThRp

// Normal sudoku rules apply (rows, columns, and boxes 1-9, default Shape('9x9')).
// Orthogonally adjacent cells cannot hold consecutive digits (AntiConsecutive,
// global -- the payload and video description carry no rules text; this and
// the rule below are transcribed verbatim from the video's on-screen rules
// panel).
// Cells a chess knight's move apart cannot repeat a digit (AntiKnight, global).

return [
  new Shape('9x9'),
  new AntiConsecutive(),
  new AntiKnight(),

  // Givens: the puzzle's only clue content, also visible in the same cells
  // in the video's rules-panel frame.
  new Given('R3C4', 4),
  new Given('R3C6', 7),
  new Given('R4C3', 6),
  new Given('R4C7', 5),
  new Given('R6C3', 4),
  new Given('R6C7', 3),
  new Given('R7C4', 2),
  new Given('R7C6', 5),
];
