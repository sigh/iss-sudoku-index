// Title: Royalty
// Author: zetamath
// Video: https://www.youtube.com/watch?v=uyTSKJ1DB6c
// Source: https://sudokupad.app/mhkw3cwjw3

// Normal Sudoku rules apply. Each purple line is a renban line: its digits
// form a non-repeating consecutive set in any order.
return [
  new Shape('9x9'),
  new Given('R1C8', 8),
  new Given('R2C3', 6),
  new Given('R3C1', 1),
  new Renban('R1C3', 'R1C2', 'R1C1', 'R2C1'),
  new Renban('R3C3', 'R3C2', 'R4C2', 'R5C2'),
  new Renban('R6C3', 'R5C3', 'R4C3', 'R4C4', 'R4C5'),
  new Renban('R6C4', 'R6C5', 'R6C6', 'R5C6'),
  new Renban('R3C4', 'R3C5', 'R3C6', 'R2C6'),
  new Renban('R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C9'),
  new Renban('R2C7', 'R1C7', 'R1C6', 'R1C5'),
  new Renban('R5C8', 'R5C7', 'R6C7', 'R7C7'),
  new Renban('R7C9', 'R8C9', 'R8C8', 'R9C8'),
  new Renban('R9C3', 'R8C3', 'R8C4', 'R8C5'),
  new Renban('R8C6', 'R9C6', 'R9C5', 'R9C4'),
  new Renban('R8C2', 'R9C2', 'R9C1'),
  new Renban('R5C1', 'R6C1', 'R7C1', 'R7C2'),
  new Renban('R1C4', 'R2C4'),
];
