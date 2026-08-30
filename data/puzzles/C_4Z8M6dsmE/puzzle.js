// Title: Untitled
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=C_4Z8M6dsmE
// Source: https://cracking-the-cryptic.web.app/sudoku/n9mq3gTF4J

// Normal Sudoku rules apply: each row, column and 3x3 box contains 1-9 once.
// The source states no rules and draws no clue geometry beyond its filled
// cells and the nine standard 3x3 boxes, so the givens below are everything
// there is to encode. Nothing is omitted; the archived puzzle is simply
// under-clued and this encoding has many completions.

// Givens, transcribed from the twelve filled cells of the source grid.
return [
  new Shape('9x9'),
  new Given('R1C6', 5),
  new Given('R2C1', 1),
  new Given('R2C8', 7),
  new Given('R3C9', 2),
  new Given('R4C1', 6),
  new Given('R4C3', 4),
  new Given('R4C6', 7),
  new Given('R5C4', 8),
  new Given('R5C8', 6),
  new Given('R7C4', 2),
  new Given('R8C4', 3),
  new Given('R8C5', 9),
];
