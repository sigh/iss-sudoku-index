// Title: Killer's Circle
// Author: Skeptical Mario
// Video: https://www.youtube.com/watch?v=cV9vrTq_E4k
// Source: https://sudokupad.app/fmlum9pis1

// Standard 9x9 Sudoku rules apply. Each listed killer cage has distinct digits
// summing to its displayed total. Cage cell lists are transcribed from the drawn cages.
return [
  new Shape('9x9'),
  new Given('R6C4', 1),
  new Given('R8C5', 8),

  new Cage(5, 'R4C1', 'R5C1'),
  new Cage(3, 'R4C9', 'R5C9'),
  new Cage(11, 'R8C9', 'R9C8', 'R9C9'),
  new Cage(12, 'R7C1', 'R8C1', 'R9C1', 'R9C2'),
  new Cage(13, 'R9C4', 'R9C5', 'R9C6'),
  new Cage(24, 'R1C8', 'R1C9', 'R2C9'),
  new Cage(21, 'R1C1', 'R1C2', 'R2C1'),
  new Cage(10, 'R1C4', 'R1C5'),
  new Cage(26, 'R3C5', 'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R6C7'),
  new Cage(24, 'R5C3', 'R6C3', 'R7C3', 'R7C4', 'R7C5', 'R7C6'),
  new Cage(12, 'R4C4', 'R4C5'),
  new Cage(12, 'R5C6', 'R6C6'),
];
