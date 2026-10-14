// Title: Cross-Threaded
// Author: Erin Toler
// Video: https://www.youtube.com/watch?v=ExZgbRqlkcY
// Source: https://sudokupad.app/erin-toler/cross-threaded

// Normal Sudoku, alternating parity on red lines, arrow sums, cage totals,
// and the positive white/black Kropki relations.
return [
  new Shape('9x9'),
  // Printed givens.
  new Given('R4C3', 2),
  new Given('R5C6', 9),
  new Given('R6C7', 1),
  // The two horizontal red strokes.
  new Modular(2, 'R1C2', 'R1C3', 'R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8'),
  new Modular(2, 'R9C2', 'R9C3', 'R9C4', 'R9C5', 'R9C6', 'R9C7', 'R9C8'),
  // Drawn circles and their arrow arms, circle first.
  new Arrow('R9C1', 'R8C1', 'R7C1', 'R6C1'),
  new Arrow('R5C5', 'R4C6', 'R5C7', 'R5C8'),
  new Arrow('R5C5', 'R6C4', 'R5C3', 'R5C2'),
  new Arrow('R3C9', 'R2C9', 'R1C9'),
  new Arrow('R7C9', 'R8C9', 'R9C9'),
  // The six dashed cages, each labelled 15.
  new Cage(15, 'R2C2', 'R3C2', 'R4C2'),
  new Cage(15, 'R6C2', 'R7C2', 'R8C2'),
  new Cage(15, 'R2C5', 'R3C5', 'R4C5'),
  new Cage(15, 'R6C5', 'R7C5', 'R8C5'),
  new Cage(15, 'R2C8', 'R3C8', 'R4C8'),
  new Cage(15, 'R6C8', 'R7C8', 'R8C8'),
  // Edge dots identified by their white or black fills.
  new WhiteDot('R3C5', 'R3C6'),
  new WhiteDot('R3C1', 'R4C1'),
  new BlackDot('R7C4', 'R7C5'),
];
