// Title: Fibonacci
// Author: Jobo
// Video: https://www.youtube.com/watch?v=cM7kaFsbnCE
// Source: https://app.crackingthecryptic.com/fy135l7its

// Normal 9x9 Sudoku; both diagonals contain no repeated digit. The shown white
// dot is consecutive and the shown black dot is a 1:2 ratio; unmarked pairs
// are unrestricted because the rules say not all dots are given.
// Givens are transcribed from the source grid.
return [
  new Shape('9x9'),
  new Given('R1C3', 1), new Given('R1C4', 3), new Given('R1C5', 4),
  new Given('R1C6', 5), new Given('R2C2', 2), new Given('R2C7', 5),
  new Given('R3C1', 3), new Given('R3C8', 8), new Given('R4C1', 1),
  new Given('R4C9', 9), new Given('R5C1', 8), new Given('R5C9', 1),
  new Given('R6C2', 5), new Given('R6C6', 1), new Given('R6C9', 4),
  new Given('R7C3', 3), new Given('R7C4', 2), new Given('R7C5', 1),
  new Given('R7C8', 4),
  new Diagonal(1),
  new Diagonal(-1),
  new WhiteDot('R5C6', 'R5C7'),
  new BlackDot('R8C5', 'R9C5'),
];
