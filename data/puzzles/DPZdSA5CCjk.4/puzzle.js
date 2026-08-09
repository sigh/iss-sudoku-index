// Title: Sep 2, 2022: Classic Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=DPZdSA5CCjk
// Source: https://tinyurl.com/2w2w5dwa

// Classic 9x9 sudoku. Rules: "Normal Sudoku rules apply. And that's it!"
// Givens transcribed from the puzzle's drawn grid (row-major, given cells only).

return [
  new Shape('9x9'),
  new Given('R1C2', 1), new Given('R1C3', 2),
  new Given('R2C5', 7), new Given('R2C6', 6), new Given('R2C9', 3),
  new Given('R3C5', 5), new Given('R3C6', 3), new Given('R3C9', 4),
  new Given('R4C2', 8), new Given('R4C3', 7),
  new Given('R5C2', 3), new Given('R5C3', 1), new Given('R5C7', 9), new Given('R5C8', 5),
  new Given('R6C7', 2), new Given('R6C8', 7),
  new Given('R7C1', 5), new Given('R7C4', 4), new Given('R7C5', 1),
  new Given('R8C1', 6), new Given('R8C4', 3), new Given('R8C5', 2),
  new Given('R9C7', 7), new Given('R9C8', 8),
];
