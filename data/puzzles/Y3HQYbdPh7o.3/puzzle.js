// Title: Dec 16, 2021: Diagonal Sudoku
// Author: Sam Cappleman-Lynes
// Video: https://www.youtube.com/watch?v=Y3HQYbdPh7o
// Source: https://tinyurl.com/mv5xkuh9

// Standard Sudoku is implicit. Both main diagonals are all-different.
const givens = [
  new Given('R1C2', 1), new Given('R1C3', 2), new Given('R1C5', 8), new Given('R1C6', 6),
  new Given('R2C3', 3),
  new Given('R3C4', 1), new Given('R3C5', 2), new Given('R3C6', 3), new Given('R3C8', 8), new Given('R3C9', 9),
  new Given('R4C1', 6), new Given('R4C2', 2),
  new Given('R5C1', 3), new Given('R5C2', 5), new Given('R5C8', 7), new Given('R5C9', 2),
  new Given('R6C8', 6), new Given('R6C9', 3),
  new Given('R7C1', 8), new Given('R7C2', 9), new Given('R7C4', 2), new Given('R7C5', 3), new Given('R7C6', 1),
  new Given('R8C7', 1),
  new Given('R9C4', 5), new Given('R9C5', 9), new Given('R9C7', 2), new Given('R9C8', 3),
];

return [
  new Shape('9x9'),
  new Diagonal(1),
  new Diagonal(-1),
  ...givens,
];
