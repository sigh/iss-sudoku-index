// Title: Sea of Love
// Author: Bill Murphy
// Video: https://www.youtube.com/watch?v=LCH-XiK3Kko
// Source: https://tinyurl.com/3uav8jnf

// Normal Sudoku rules are supplied by Shape. The listed cells are the source's givens.
return [
  new Shape('9x9'),
  new Given('R1C6', 1), new Given('R1C7', 2), new Given('R1C8', 3), new Given('R1C9', 4),
  new Given('R2C4', 8),
  new Given('R3C6', 5), new Given('R3C7', 6), new Given('R3C8', 7),
  new Given('R4C5', 3), new Given('R4C8', 6),
  new Given('R5C2', 9), new Given('R5C4', 2), new Given('R5C7', 3),
  new Given('R6C1', 1), new Given('R6C3', 5), new Given('R6C6', 8),
  new Given('R7C1', 2), new Given('R7C3', 6), new Given('R7C5', 1),
  new Given('R8C1', 3), new Given('R8C3', 7), new Given('R8C4', 9), new Given('R8C8', 4),
  new Given('R9C1', 4), new Given('R9C9', 3),
];
