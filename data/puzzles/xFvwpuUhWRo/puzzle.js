// Title: Thirteens
// Author: Bram Cohen
// Video: https://www.youtube.com/watch?v=xFvwpuUhWRo
// Source: https://sudokupad.app/3o8j3x2kzc

// Normal sudoku rules apply. Digits in a cage sum to 13 and do not repeat.
// No givens; 22 cages of three cells, each with total 13.

// Cages: cells from the drawn killer cages; every total is 13.
const cages = [
  new Cage(13, 'R1C1', 'R2C1', 'R2C2'),
  new Cage(13, 'R1C2', 'R1C3', 'R1C4'),
  new Cage(13, 'R1C6', 'R1C7', 'R1C8'),
  new Cage(13, 'R1C9', 'R2C8', 'R2C9'),
  new Cage(13, 'R2C4', 'R3C4', 'R3C5'),
  new Cage(13, 'R2C5', 'R2C6', 'R3C6'),
  new Cage(13, 'R2C7', 'R3C7', 'R4C7'),
  new Cage(13, 'R3C1', 'R3C2', 'R3C3'),
  new Cage(13, 'R3C8', 'R4C8', 'R4C9'),
  new Cage(13, 'R4C1', 'R4C2', 'R4C3'),
  new Cage(13, 'R5C2', 'R5C3', 'R6C3'),
  new Cage(13, 'R5C5', 'R5C6', 'R5C7'),
  new Cage(13, 'R5C8', 'R5C9', 'R6C8'),
  new Cage(13, 'R6C1', 'R7C1', 'R7C2'),
  new Cage(13, 'R6C5', 'R6C6', 'R6C7'),
  new Cage(13, 'R7C5', 'R7C6', 'R8C6'),
  new Cage(13, 'R7C7', 'R7C8', 'R8C8'),
  new Cage(13, 'R7C9', 'R8C9', 'R9C9'),
  new Cage(13, 'R8C1', 'R8C2', 'R8C3'),
  new Cage(13, 'R8C4', 'R8C5', 'R9C5'),
  new Cage(13, 'R9C2', 'R9C3', 'R9C4'),
  new Cage(13, 'R9C6', 'R9C7', 'R9C8'),
];

return [
  new Shape('9x9'),
  ...cages,
];
