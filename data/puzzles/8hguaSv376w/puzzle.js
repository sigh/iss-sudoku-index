// Title: One Trick Pony
// Author: Arbitrary
// Video: https://www.youtube.com/watch?v=8hguaSv376w
// Source: https://sudokupad.app/rdb3z3k51d

// Normal Sudoku rules apply. Cages have distinct digits summing to their labels.
// Each arrow arm sums to its connected circle.
// Cage cells are transcribed from the outlined cages in the source artwork.
const cages = [
  new Cage(17, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(13, 'R4C7', 'R5C7'),
  new Cage(17, 'R1C9', 'R2C8', 'R2C9'),
  new Cage(10, 'R5C8', 'R6C8'),
  new Cage(22, 'R4C5', 'R5C4', 'R5C5'),
];

// Each list starts with its drawn circle, followed by the cells on that arrow arm.
const arrows = [
  new Arrow('R2C2', 'R2C3', 'R2C4', 'R2C5'),
  new Arrow('R2C2', 'R3C2', 'R4C2', 'R5C2'),
  new Arrow('R2C7', 'R1C7', 'R1C6', 'R1C5'),
  new Arrow('R2C7', 'R3C8', 'R3C7', 'R3C6'),
  new Arrow('R8C2', 'R8C3', 'R7C3', 'R6C3'),
  new Arrow('R8C2', 'R7C1', 'R6C1', 'R5C1'),
  new Arrow('R8C7', 'R8C8', 'R7C8', 'R7C7'),
  new Arrow('R7C4', 'R6C5', 'R7C6'),
];

return [new Shape('9x9'), ...cages, ...arrows];
