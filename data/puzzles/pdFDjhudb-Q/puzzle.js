// Title: This Way Up
// Author: 99%Sneaky
// Video: https://www.youtube.com/watch?v=pdFDjhudb-Q
// Source: https://sudokupad.app/fstz89rrrr

// Normal sudoku rules (default row/column/box all-different from Shape).
// Killer cages: digits in each cage do not repeat and sum to the cage total.
// Arrows: digits along the arrow sum to the digit in the attached bulb
// circle (Arrow's first argument).
// Same-digit diamond: the two cells marked with the small blue diamond
// (R5C4 and R1C9) hold the same digit.

return [
  new Shape('9x9'),

  new Cage(29, 'R5C5', 'R6C5', 'R7C5', 'R8C5', 'R9C5'),
  new Cage(16, 'R1C4', 'R2C4', 'R3C3', 'R3C4'),
  new Cage(17, 'R1C6', 'R2C6', 'R3C6', 'R3C7'),
  new Cage(9, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(9, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(23, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
  new Cage(12, 'R3C8', 'R3C9'),
  new Cage(23, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(9, 'R9C3', 'R9C4'),

  new Arrow('R1C5', 'R2C5', 'R3C5', 'R4C5'),
  new Arrow('R7C1', 'R6C1', 'R5C1', 'R4C1'),
  new Arrow('R7C3', 'R6C3', 'R5C3'),
  new Arrow('R7C7', 'R6C7', 'R5C7'),
  new Arrow('R7C9', 'R6C9', 'R5C9'),
  new Arrow('R6C6', 'R7C6', 'R8C6'),
  new Arrow('R5C6', 'R4C7', 'R4C8'),

  new SameValues(2, 'R5C4', 'R1C9'),
];
