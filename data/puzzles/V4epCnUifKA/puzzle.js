// Title: Quadruple Knight Sudoku
// Author: Eric Dunn
// Video: https://www.youtube.com/watch?v=V4epCnUifKA
// Source: https://cracking-the-cryptic.web.app/sudoku/Rbd2qbRpN3

// Normal sudoku rules apply. AntiKnight forbids equal digits a chess knight's
// move apart. Each Quad is a presence-only quadruple clue: its four listed
// digits are exactly the digits present somewhere in the surrounding 2x2
// square, with no claim about which of the four cells holds which digit.
//
// Quad anchor cells and digit lists are transcribed from the puzzle's drawn
// circle overlays, cross-checked against the video's on-screen rules panel.

return [
  new Shape('9x9'),
  new AntiKnight(),
  new Quad('R1C1', 1, 2, 7, 8),
  new Quad('R4C2', 1, 2, 7, 8),
  new Quad('R2C4', 1, 2, 7, 8),
  new Quad('R1C8', 5, 6, 8, 9),
  new Quad('R8C8', 1, 3, 4, 9),
  new Quad('R5C7', 1, 3, 4, 9),
  new Quad('R7C5', 1, 3, 4, 9),
  new Quad('R8C1', 2, 3, 5, 6),
  new Quad('R6C6', 4, 5, 8, 9),
  new Quad('R3C3', 2, 3, 6, 7),
];
