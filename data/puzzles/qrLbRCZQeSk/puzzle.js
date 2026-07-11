// Title: Forty-Four
// Author: James Sinclair
// Video: https://www.youtube.com/watch?v=qrLbRCZQeSk
// Source: https://sudokupad.app/james-sinclair/forty-four

// Normal sudoku, no givens. Killer cages: digits do not repeat and sum to
// the cage total; all seven cages sum to 44. Purple renban lines hold
// non-repeating consecutive digits in any order. The dynamic fog is
// SudokuPad reveal behavior only and adds no constraint, so it is not
// encoded.

return [
  new Shape('9x9'),

  new Cage(44, 'R4C7', 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R7C4', 'R7C5', 'R8C4'),
  new Cage(44, 'R4C8', 'R5C8', 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C6', 'R9C6'),
  new Cage(44, 'R4C9', 'R5C9', 'R6C9', 'R7C9', 'R8C8', 'R8C9', 'R9C7', 'R9C8'),
  new Cage(44, 'R4C4', 'R4C5', 'R5C4', 'R6C3', 'R6C4', 'R7C3', 'R8C2', 'R8C3'),
  new Cage(44, 'R3C2', 'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7', 'R4C3', 'R5C3'),
  new Cage(44, 'R1C5', 'R1C6', 'R1C8', 'R1C9', 'R2C6', 'R2C7', 'R2C8', 'R2C9'),
  new Cage(44, 'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C1', 'R4C1', 'R5C1', 'R6C1'),

  new Renban('R6C7', 'R7C7', 'R8C8', 'R9C8', 'R9C7'),
  new Renban('R8C5', 'R8C4', 'R8C3', 'R7C2'),
  new Renban('R1C8', 'R1C9', 'R2C9'),
  new Renban('R5C3', 'R6C3', 'R7C4', 'R7C5', 'R7C6'),
  new Renban('R5C4', 'R4C5', 'R3C5', 'R4C6'),
  new Renban('R2C4', 'R2C5'),
  new Renban('R6C9', 'R7C9'),
  new Renban('R7C1', 'R6C1', 'R6C2'),
  new Renban('R1C2', 'R2C3', 'R1C4'),
];
