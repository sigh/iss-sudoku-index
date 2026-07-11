// Title: 5 Killers and a Nightmare
// Author: Cassinii
// Video: https://www.youtube.com/watch?v=MDx8QVOCub8
// Source: https://sudokupad.app/2jc04tkyx0

// Irregular Sudoku: place 1-6 once each in every row, column, and irregular
// region (no default 3x2 boxes). Killer Cages: digits in a cage do not
// repeat and sum to the small number in the top left corner of the cage.

return [
  new Shape('6x6'),
  new NoBoxes(),

  // Irregular regions (six 6-cell jigsaw pieces).
  new Jigsaw('6x6', 'R1C1', 'R1C2', 'R2C1', 'R3C1', 'R3C2', 'R4C1'),
  new Jigsaw('6x6', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R2C2', 'R2C3'),
  new Jigsaw('6x6', 'R4C2', 'R4C3', 'R4C4', 'R5C1', 'R5C2', 'R6C1'),
  new Jigsaw('6x6', 'R4C5', 'R5C3', 'R5C4', 'R5C5', 'R6C2', 'R6C3'),
  new Jigsaw('6x6', 'R3C6', 'R4C6', 'R5C6', 'R6C4', 'R6C5', 'R6C6'),
  new Jigsaw('6x6', 'R2C4', 'R2C5', 'R2C6', 'R3C3', 'R3C4', 'R3C5'),

  // Killer cages.
  new Cage(7, 'R1C1', 'R1C2'),
  new Cage(7, 'R2C5', 'R2C6'),
  new Cage(6, 'R3C4', 'R4C4'),
  new Cage(5, 'R5C1', 'R5C2'),
  new Cage(6, 'R6C5', 'R6C6'),
];
