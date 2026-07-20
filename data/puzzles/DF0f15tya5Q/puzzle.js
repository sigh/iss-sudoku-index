// Title: Scylla
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=DF0f15tya5Q
// Source: https://sudokupad.app/5yg1tpwhow

// Normal Sudoku rules are supplied by the 9x9 shape. Each Cage enforces both
// the stated total and non-repetition within that cage.
const cages = [
  new Cage(9, 'R1C1', 'R1C2', 'R1C3'),
  new Cage(8, 'R1C7', 'R1C8'),
  new Cage(8, 'R2C4', 'R2C5'),
  new Cage(14, 'R3C2', 'R3C3'),
  new Cage(18, 'R3C7', 'R3C8', 'R3C9'),
  new Cage(11, 'R4C5', 'R5C5', 'R6C5'),
  new Cage(11, 'R5C2', 'R6C2'),
  new Cage(6, 'R5C8', 'R6C8'),
  new Cage(15, 'R6C1', 'R7C1', 'R8C1', 'R9C1'),
  new Cage(18, 'R6C3', 'R6C4', 'R7C3', 'R7C4'),
  new Cage(18, 'R6C6', 'R6C7', 'R7C6', 'R7C7'),
  new Cage(27, 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Cage(10, 'R8C3', 'R9C3'),
  new Cage(10, 'R8C7', 'R9C7'),
  new Cage(23, 'R8C5', 'R9C4', 'R9C5', 'R9C6'),
];

return [
  new Shape('9x9'),
  ...cages,
];
