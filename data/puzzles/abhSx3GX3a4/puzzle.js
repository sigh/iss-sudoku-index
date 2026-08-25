// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=abhSx3GX3a4
// Source: https://sudokupad.app/z4lvexlyi9

// Normal sudoku rules apply (standard 3x3 box regions; no jigsaw regions are
// drawn). In each cage digits may not repeat and must sum to the printed
// total -- exactly Cage's own semantics, so no extra AllDifferent is needed.
// Cage cell lists are transcribed from the puzzle's drawn cage geometry.
const cages = [
  new Cage(16, 'R1C1', 'R2C1', 'R3C1', 'R4C1'),
  new Cage(8, 'R1C2', 'R1C3', 'R1C4'),
  new Cage(20, 'R2C2', 'R2C3', 'R2C4'),
  new Cage(9, 'R3C2', 'R4C2'),
  new Cage(13, 'R3C3', 'R3C4'),
  new Cage(22, 'R1C5', 'R1C6', 'R1C7', 'R2C7'),
  new Cage(18, 'R2C6', 'R2C5', 'R3C5', 'R4C5'),
  new Cage(7, 'R3C6', 'R4C6', 'R4C7'),
  new Cage(21, 'R3C7', 'R3C8', 'R4C8'),
  new Cage(11, 'R1C8', 'R2C8'),
  new Cage(19, 'R1C9', 'R2C9', 'R3C9', 'R4C9'),
  new Cage(30, 'R4C3', 'R4C4', 'R5C4', 'R6C4'),
  new Cage(20, 'R5C2', 'R5C1', 'R6C1', 'R7C1'),
  new Cage(15, 'R5C3', 'R6C3', 'R6C2'),
  new Cage(4, 'R5C5', 'R6C5'),
  new Cage(18, 'R5C7', 'R5C6', 'R6C6'),
  new Cage(12, 'R6C7', 'R7C7'),
  new Cage(22, 'R5C8', 'R5C9', 'R6C9', 'R6C8'),
  new Cage(14, 'R7C2', 'R7C3'),
  new Cage(13, 'R8C1', 'R8C2', 'R8C3', 'R8C4'),
  new Cage(7, 'R9C1', 'R9C2'),
  new Cage(18, 'R9C3', 'R9C4', 'R9C5'),
  new Cage(7, 'R7C4', 'R7C5', 'R7C6'),
  new Cage(18, 'R8C5', 'R8C6', 'R8C7'),
  new Cage(17, 'R9C6', 'R9C7'),
  new Cage(9, 'R7C8', 'R7C9'),
  new Cage(17, 'R8C8', 'R8C9', 'R9C9', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...cages,
];
