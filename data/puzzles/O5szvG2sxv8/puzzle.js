// Title: Domino
// Author: SXH
// Video: https://www.youtube.com/watch?v=O5szvG2sxv8
// Source: https://sudokupad.app/du7tb8qbxq

// Normal Sudoku rules apply. Digits in each killer cage are distinct and
// sum to the indicated total.
const cages = [
  new Cage(8, 'R2C2', 'R2C3'),
  new Cage(8, 'R3C2', 'R3C3'),
  new Cage(8, 'R7C7', 'R7C8'),
  new Cage(8, 'R8C7', 'R8C8'),
  new Cage(9, 'R7C2', 'R8C2'),
  new Cage(9, 'R7C3', 'R8C3'),
  new Cage(9, 'R6C2', 'R6C3'),
  new Cage(9, 'R5C2', 'R5C3'),
  new Cage(9, 'R2C7', 'R3C7'),
  new Cage(9, 'R2C8', 'R3C8'),
  new Cage(9, 'R4C7', 'R4C8'),
  new Cage(9, 'R5C7', 'R5C8'),
  new Cage(11, 'R6C7', 'R6C8'),
  new Cage(11, 'R4C2', 'R4C3'),
  new Cage(15, 'R7C4', 'R8C4'),
  new Cage(9, 'R7C5', 'R8C5'),
  new Cage(6, 'R7C6', 'R8C6'),
  new Cage(7, 'R2C4', 'R3C4'),
  new Cage(8, 'R2C5', 'R3C5'),
  new Cage(8, 'R4C5', 'R4C6', 'R5C6'),
  new Cage(14, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(14, 'R8C9', 'R9C8', 'R9C9'),
];

return [
  new Shape('9x9'),
  ...cages,
];
