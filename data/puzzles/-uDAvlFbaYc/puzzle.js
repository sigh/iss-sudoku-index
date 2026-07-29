// Title: Mission Impossible
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=-uDAvlFbaYc
// Source: https://sudokupad.app/dxuvqdw2co

// Normal Sudoku rules apply. Arrow bulbs equal the sums of their shaft digits.
// Cells a chess knight's move apart cannot contain the same digit.
// Givens and arrow paths are transcribed from the drawn puzzle.
return [
  new Shape('9x9'),
  new Given('R4C2', 3),
  new Given('R7C1', 7),
  new Given('R7C3', 5),
  new AntiKnight(),
  new Arrow('R6C3', 'R7C2', 'R8C2'),
  new Arrow('R4C1', 'R3C2', 'R2C2'),
  new Arrow('R4C7', 'R3C8', 'R2C8'),
  new Arrow('R6C9', 'R7C8', 'R8C8'),
  new Arrow('R4C3', 'R5C4', 'R5C5'),
  new Arrow('R6C7', 'R5C6', 'R5C5'),
];
