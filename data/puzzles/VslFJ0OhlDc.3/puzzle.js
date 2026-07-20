// Title: Snackdoku Title Puzzle
// Author: Panthera
// Video: https://www.youtube.com/watch?v=VslFJ0OhlDc
// Source: https://sudokupad.app/tkn1nytyis

// Standard Sudoku rules are implicit. Only the six drawn Kropki dots apply;
// there is no negative Kropki constraint.
return [
  new Shape('9x9'),

  new Given('R1C2', 1),
  new Given('R1C5', 4),
  new Given('R2C3', 6),
  new Given('R2C9', 1),
  new Given('R3C4', 5),
  new Given('R3C7', 2),
  new Given('R4C3', 3),
  new Given('R4C4', 6),
  new Given('R4C9', 9),
  new Given('R6C2', 7),
  new Given('R6C5', 1),
  new Given('R6C8', 2),
  new Given('R7C1', 1),
  new Given('R7C6', 2),
  new Given('R7C7', 4),
  new Given('R8C4', 4),
  new Given('R9C3', 9),
  new Given('R9C8', 7),

  new BlackDot('R3C1', 'R3C2'),
  new BlackDot('R1C6', 'R2C6'),
  new BlackDot('R7C8', 'R7C9'),
  new BlackDot('R8C2', 'R9C2'),

  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R7C5', 'R8C5'),
];
