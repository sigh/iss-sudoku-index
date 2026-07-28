// Title: XX Sandwich
// Author: Tomatenalat
// Video: https://www.youtube.com/watch?v=02c30ij7d0Y
// Source: https://sudokupad.app/i9jmywmume

// Normal Sudoku, anti-knight, the six drawn killer cages, and the four drawn arrows.
// Cage and arrow coordinates are transcribed from the source's clue data.
return [
  new Shape('9x9'),
  new AntiKnight(),
  new Cage(20, 'R2C4', 'R2C5', 'R2C6'),
  new Cage(9, 'R8C4', 'R8C5', 'R8C6'),
  new Cage(14, 'R5C3', 'R6C3', 'R7C3'),
  new Cage(8, 'R2C2', 'R2C3'),
  new Cage(8, 'R4C2', 'R4C3'),
  new Cage(15, 'R8C8', 'R8C9', 'R9C8'),
  new Arrow('R7C4', 'R6C5', 'R5C6'),
  new Arrow('R7C6', 'R6C5', 'R5C4'),
  new Arrow('R3C6', 'R4C5', 'R5C4'),
  new Arrow('R3C4', 'R4C5', 'R5C6'),
];
