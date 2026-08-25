// Title: Non Consecutive Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=yEfmuTFq_L0
// Source: https://app.crackingthecryptic.com/webapp/HFQNbqqB4n

// Normal sudoku rules apply (1-9 in each row, column and 3x3 box). Standard
// 3x3 box regions -- Shape('9x9') supplies rows/columns/boxes, matching the
// 9 whole-box regions in the payload. Horizontally and vertically adjacent
// cells cannot hold consecutive digits (AntiConsecutive: a global orthogonal
// no-adjacent-consecutive rule). No other clue types (lines, cages, arrows)
// appear in the payload; the puzzle is fully determined by its 14 givens
// below plus the adjacency rule.

// Givens, as drawn on the board (cell ids below are 1-indexed R#C#).
return [
  new Shape('9x9'),
  new AntiConsecutive(),

  new Given('R6C1', 3),
  new Given('R6C3', 9),
  new Given('R6C5', 4),
  new Given('R6C7', 1),
  new Given('R6C9', 6),
  new Given('R7C2', 9),
  new Given('R7C4', 4),
  new Given('R7C6', 5),
  new Given('R7C8', 3),
  new Given('R8C1', 8),
  new Given('R8C3', 7),
  new Given('R8C5', 6),
  new Given('R8C7', 5),
  new Given('R8C9', 4),
];
