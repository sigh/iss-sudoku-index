// Title: Half the Digits
// Author: Cane_Puzzles
// Video: https://www.youtube.com/watch?v=51Q9V7nBP9E
// Source: https://sudokupad.app/mqrdnrGFb3

// Normal Sudoku rules apply. Each listed killer cage has distinct digits that sum to its drawn total.
// Cage cells and totals are transcribed from the drawn killer cages.
return [
  new Shape('9x9'),
  new Cage(23, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(12, 'R2C2', 'R2C3', 'R3C2', 'R3C3'),
  new Cage(10, 'R3C5', 'R4C5', 'R4C6'),
  new Cage(3, 'R4C8', 'R4C9'),
  new Cage(22, 'R4C3', 'R5C3', 'R5C4', 'R5C5', 'R5C6'),
  new Cage(13, 'R6C4', 'R6C5', 'R7C5', 'R7C6'),
  new Cage(13, 'R7C7', 'R7C8', 'R8C7', 'R8C8'),
  new Cage(24, 'R8C1', 'R9C1', 'R9C2'),
];
