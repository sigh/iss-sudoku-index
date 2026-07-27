// Title: Foggy Killer Knights
// Author: Meggen033
// Video: https://www.youtube.com/watch?v=i2to2xXCprA
// Source: https://sudokupad.app/rlnmoj3n00

// Standard Sudoku is implicit. Digits a knight's move apart cannot repeat.
// Cage totals and cells are transcribed from the raw `killercage` list.
const cages = [
  new Cage(4, 'R5C5', 'R6C5'),
  new Cage(5, 'R6C7', 'R6C8'),
  new Cage(6, 'R4C7', 'R5C7'),
  new Cage(8, 'R7C7', 'R7C8', 'R8C8'),
  new Cage(10, 'R8C6', 'R8C7'),
  new Cage(9, 'R8C5', 'R9C4', 'R9C5'),
  new Cage(10, 'R8C3', 'R9C3'),
  new Cage(8, 'R7C2', 'R8C2'),
  new Cage(13, 'R6C1', 'R6C2'),
  new Cage(13, 'R3C9', 'R4C9', 'R5C9'),
  new Cage(10, 'R3C6', 'R3C7', 'R4C6'),
  new Cage(11, 'R3C3', 'R3C4', 'R4C3'),
  new Cage(18, 'R2C2', 'R2C3', 'R3C2'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...cages,
];
