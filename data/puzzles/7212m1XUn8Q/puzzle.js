// Title: New York City
// Author: ICHTUES
// Video: https://www.youtube.com/watch?v=7212m1XUn8Q
// Source: https://sudokupad.app/3doylfz343

// Normal Sudoku, both main diagonals, and distinct-digit killer cages.
const cages = [
  new Cage(37, 'R1C2', 'R1C3', 'R2C3', 'R2C4', 'R2C5', 'R3C4', 'R3C5'),
  new Cage(42, 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R2C6', 'R2C7', 'R3C6'),
  new Cage(15, 'R5C1', 'R5C2', 'R5C3'),
  new Cage(35, 'R6C1', 'R6C2', 'R6C3', 'R7C1', 'R7C2', 'R8C1'),
  new Cage(37, 'R2C1', 'R3C1', 'R3C2', 'R4C1', 'R4C2', 'R4C3'),
  new Cage(32, 'R7C4', 'R8C3', 'R8C4', 'R9C2', 'R9C3', 'R9C4', 'R9C5'),
  new Cage(20, 'R7C5', 'R7C6', 'R8C5'),
  new Cage(27, 'R8C6', 'R8C7', 'R9C6', 'R9C7', 'R9C8'),
  new Cage(29, 'R6C7', 'R6C8', 'R6C9', 'R7C8', 'R7C9', 'R8C9'),
  new Cage(14, 'R5C7', 'R5C8', 'R5C9'),
  new Cage(25, 'R2C9', 'R3C8', 'R3C9', 'R4C7', 'R4C8', 'R4C9'),
];

return [
  new Shape('9x9'),
  new Diagonal(-1),
  new Diagonal(1),
  ...cages,
];
