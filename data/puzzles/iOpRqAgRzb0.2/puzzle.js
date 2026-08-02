// Title: Belinda Says
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=iOpRqAgRzb0
// Source: https://tinyurl.com/5n7xz2yd

// Standard 9x9 Sudoku with the 25 given digits from the source grid.
return [
  new Shape('9x9'),
  new Given('R1C3', 1), new Given('R1C4', 5),
  new Given('R2C3', 8), new Given('R2C5', 1), new Given('R2C6', 9), new Given('R2C7', 5),
  new Given('R3C2', 9), new Given('R3C8', 8), new Given('R3C9', 2),
  new Given('R4C2', 2), new Given('R4C9', 7),
  new Given('R5C2', 4), new Given('R5C5', 9), new Given('R5C8', 2),
  new Given('R6C1', 8), new Given('R6C8', 4),
  new Given('R7C1', 4), new Given('R7C2', 7), new Given('R7C8', 9),
  new Given('R8C3', 6), new Given('R8C4', 9), new Given('R8C5', 3), new Given('R8C7', 7),
  new Given('R9C6', 6), new Given('R9C7', 3),
];
