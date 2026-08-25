// Title: Killer Sudoku
// Author: Unknown
// Video: https://www.youtube.com/watch?v=D3wcNdO4pDI
// Source: https://app.crackingthecryptic.com/RDL4QdPdJq

// Standard Sudoku. 21 killer cages (no repeats, sum to the printed total)
// tile the grid exactly (81 cells, no overlaps or gaps); no givens.
const cages = [
  new Cage(18, 'R1C1', 'R1C2', 'R1C3', 'R1C4'),
  new Cage(17, 'R1C5', 'R1C6', 'R2C5', 'R2C6'),
  new Cage(40, 'R1C7', 'R1C8', 'R1C9', 'R2C7', 'R2C8', 'R2C9', 'R3C8', 'R3C9'),
  new Cage(42, 'R2C1', 'R2C2', 'R2C3', 'R2C4', 'R3C1', 'R3C3', 'R4C3'),
  new Cage(14, 'R3C4', 'R4C4', 'R5C4'),
  new Cage(30, 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7'),
  new Cage(15, 'R4C8', 'R4C9', 'R5C8', 'R5C9'),
  new Cage(9, 'R3C2', 'R4C2'),
  new Cage(9, 'R4C1', 'R5C1', 'R5C2'),
  new Cage(8, 'R6C1', 'R7C1'),
  new Cage(17, 'R6C2', 'R7C2'),
  new Cage(23, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(33, 'R5C3', 'R6C3', 'R6C4', 'R7C3', 'R7C4', 'R7C5'),
  new Cage(11, 'R8C3', 'R8C4'),
  new Cage(3, 'R9C3', 'R9C4'),
  new Cage(18, 'R8C5', 'R9C5', 'R9C6'),
  new Cage(23, 'R4C5', 'R4C6', 'R5C5', 'R5C6'),
  new Cage(11, 'R6C5', 'R6C6', 'R6C7'),
  new Cage(13, 'R8C6', 'R8C7'),
  new Cage(16, 'R6C9', 'R7C9', 'R8C9', 'R9C9'),
  new Cage(35, 'R6C8', 'R7C6', 'R7C7', 'R7C8', 'R8C8', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...cages,
];
