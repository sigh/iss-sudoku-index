// Title: Frog Print
// Author: Walter Gronholm
// Video: https://www.youtube.com/watch?v=VUelKDmaZvM
// Source: https://sudokupad.app/f9kpjvpt0p

// Normal sudoku rules apply.
// Arrow: digits along the arrow sum to the digit in the attached circle
//   (the circled cell is the first arrow cell).
return [
  new Shape('9x9'),

  new Given('R3C7', 3),
  new Given('R5C5', 3),
  new Given('R7C3', 3),

  new Arrow('R9C7', 'R8C7', 'R7C7'),
  new Arrow('R7C9', 'R7C8', 'R7C7'),
  new Arrow('R7C5', 'R7C4', 'R7C3'),
  new Arrow('R7C1', 'R7C2', 'R7C3'),
  new Arrow('R1C7', 'R2C7', 'R3C7'),
  new Arrow('R5C7', 'R4C7', 'R3C7'),
  new Arrow('R7C6', 'R6C5'),
  new Arrow('R6C7', 'R5C6'),
  new Arrow('R5C1', 'R6C2', 'R7C3'),
  new Arrow('R1C5', 'R2C6', 'R3C7'),
  new Arrow('R4C4', 'R5C5', 'R6C6'),
  new Arrow('R4C4', 'R3C5'),
  new Arrow('R4C4', 'R5C3'),
  new Arrow('R1C1', 'R2C2', 'R3C3'),
  new Arrow('R3C1', 'R3C2', 'R3C3'),
  new Arrow('R1C3', 'R2C3', 'R3C3'),
  new Arrow('R8C5', 'R8C4', 'R9C4'),
  new Arrow('R8C2', 'R9C3', 'R9C4'),
  new Arrow('R2C8', 'R3C9', 'R4C9'),
];
