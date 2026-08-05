// Title: Papa, Papa
// Author: DipakR
// Video: https://www.youtube.com/watch?v=v20Y5nAJNOE
// Source: https://app.crackingthecryptic.com/sudoku/h7d9rfNnmq

// Normal Sudoku; shown cages have distinct digits summing to their printed totals.
// A chess knight's move may not repeat a digit; the marked R1C1-to-R9C9 diagonal is distinct.
// Givens and cage cells transcribed from the drawn puzzle.
return [
  new Shape('9x9'),
  new Given('R3C2', 8), new Given('R3C5', 4), new Given('R3C8', 5),
  new Given('R5C2', 7), new Given('R5C7', 2), new Given('R5C8', 3),
  new Given('R6C2', 9),
  new Given('R7C2', 5), new Given('R7C5', 3), new Given('R7C8', 1),
  new Given('R9C5', 6),
  new Cage(15, 'R1C2', 'R1C3', 'R1C4'),
  new Cage(24, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(10, 'R2C8', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(10, 'R4C4', 'R5C4', 'R6C4', 'R7C4'),
  new Cage(7, 'R8C3', 'R9C2', 'R9C3'),
  new AntiKnight(),
  new Diagonal(-1),
];
