// Title: Irregular Antiknight Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=dNdCU9Cvqjk
// Source: https://cracking-the-cryptic.web.app/sudoku/jF8BdgTHH7

// 6x6 grid with six irregular jigsaw regions (replacing the default boxes),
// each containing 1-6 once. Cells a knight's move apart cannot repeat a
// digit (antiknight). Rows and columns are the default all-different groups.
// The bottom row is given as 1,2,3,4,5,6 left to right.

return [
  new Shape('6x6'),
  new NoBoxes(),
  new AntiKnight(),

  // Jigsaw regions, transcribed from the puzzle's drawn region layout.
  new Jigsaw('6x6', 'R1C1', 'R2C1', 'R2C2', 'R2C3', 'R3C3', 'R3C4'),
  new Jigsaw('6x6', 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R2C4', 'R2C5'),
  new Jigsaw('6x6', 'R3C1', 'R3C2', 'R4C1', 'R5C1', 'R5C2', 'R5C3'),
  new Jigsaw('6x6', 'R1C6', 'R2C6', 'R3C5', 'R3C6', 'R4C5', 'R4C6'),
  new Jigsaw('6x6', 'R6C1', 'R6C2', 'R6C3', 'R6C4', 'R6C5', 'R6C6'),
  new Jigsaw('6x6', 'R4C2', 'R4C3', 'R4C4', 'R5C4', 'R5C5', 'R5C6'),

  // Givens: bottom row, left to right.
  new Given('R6C1', 1),
  new Given('R6C2', 2),
  new Given('R6C3', 3),
  new Given('R6C4', 4),
  new Given('R6C5', 5),
  new Given('R6C6', 6),
];
