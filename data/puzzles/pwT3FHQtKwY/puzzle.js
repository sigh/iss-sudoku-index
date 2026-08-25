// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=pwT3FHQtKwY
// Source: https://sudokupad.app/JDtFJ6QDBd

// Normal sudoku rules apply. In cages, digits may not repeat and must sum to
// the indicated total. 24 cages, cell lists and totals from the drawn
// `cages` array, partition the whole grid.

return [
  new Shape('9x9'),

  new Cage(17, 'R1C1', 'R2C1', 'R3C1', 'R3C2'),
  new Cage(27, 'R1C2', 'R2C2', 'R2C3', 'R3C3'),
  new Cage(17, 'R1C3', 'R1C4', 'R1C5', 'R1C6'),
  new Cage(11, 'R1C7', 'R1C8'),
  new Cage(7, 'R2C4', 'R3C4', 'R4C4'),
  new Cage(19, 'R2C5', 'R2C6', 'R3C6', 'R4C6'),
  new Cage(21, 'R1C9', 'R2C9', 'R2C8', 'R2C7'),
  new Cage(18, 'R4C7', 'R3C7', 'R3C8', 'R3C9'),
  new Cage(30, 'R4C8', 'R4C9', 'R5C9', 'R5C8'),
  new Cage(21, 'R4C1', 'R5C1', 'R6C1', 'R6C2'),
  new Cage(9, 'R4C2', 'R5C2'),
  new Cage(9, 'R4C3', 'R5C3', 'R5C4'),
  new Cage(31, 'R7C1', 'R7C2', 'R7C3', 'R6C3', 'R6C4'),
  new Cage(18, 'R8C1', 'R8C2', 'R9C2', 'R9C1'),
  new Cage(18, 'R8C3', 'R9C3', 'R9C4'),
  new Cage(20, 'R7C5', 'R7C4', 'R8C4', 'R8C5'),
  new Cage(28, 'R3C5', 'R4C5', 'R5C5', 'R6C5'),
  new Cage(10, 'R5C6', 'R6C6'),
  new Cage(8, 'R5C7', 'R6C7', 'R6C8'),
  new Cage(12, 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Cage(22, 'R7C6', 'R7C7', 'R7C8'),
  new Cage(13, 'R8C6', 'R8C7', 'R8C8'),
  new Cage(4, 'R9C5', 'R9C6'),
  new Cage(15, 'R9C7', 'R9C8'),
];
